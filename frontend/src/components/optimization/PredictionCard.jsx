import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain, faCalculator } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import api from '../../services/api';

const CONFIDENCE_COLORS = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600'
};

function PredictionCard({ jobId, items, container, onPrediction }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simple volume calculation
  const totalItemVolume = items.reduce((sum, item) => {
    const volumeMm3 = item.length * item.width * item.height * item.quantity;
    return sum + volumeMm3 / 1e9; // Convert to m³
  }, 0);
  
  const containerVolume = container?.volume || 0;
  const simpleUtilization = containerVolume > 0 
    ? Math.round((totalItemVolume / containerVolume) * 100) 
    : 0;

  const handleGetPrediction = async () => {
    try {
      setLoading(true);
      const response = await api.get(`api/predict/job/${jobId}`);
      setPrediction(response.data);
      onPrediction?.(response.data);
      toast.success(`AI prediction complete`);
    } catch (err) {
      if (err.response?.data?.fallback) {
        toast.error('ML service unavailable');
      } else {
        toast.error('Failed to get prediction');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Simple Volume Estimate - Always Show */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FontAwesomeIcon icon={faCalculator} className="text-blue-600" />
          <span className="font-semibold text-blue-800">Volume Estimate</span>
        </div>
        <p className="text-2xl font-bold text-blue-700">
          {simpleUtilization}% fill
        </p>
        <p className="text-sm text-blue-600">
          {totalItemVolume.toFixed(2)} m³ / {containerVolume} m³
        </p>
      </div>

      {/* ML Prediction */}
      {!prediction ? (
        <button
          onClick={handleGetPrediction}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          <FontAwesomeIcon icon={faBrain} className="mr-2" />
          {loading ? 'Predicting...' : 'Get AI Packing Efficiency'}
        </button>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faBrain} className="text-purple-600" />
            <span className="font-semibold text-purple-800">AI Packing Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {Math.round(prediction.prediction * 100)}%
          </p>
          <p className={`text-sm ${CONFIDENCE_COLORS[prediction.confidence]}`}>
            Confidence: {prediction.confidence}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            How efficiently items can be arranged together
          </p>
        </div>
      )}
    </div>
  );
}

export default PredictionCard;