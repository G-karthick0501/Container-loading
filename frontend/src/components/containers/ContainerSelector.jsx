import { useState, useEffect } from 'react';
import api from '../../services/api';
import TransportModeTabs from './TransportModeTabs';
import ContainerGrid from './ContainerGrid';

function ContainerSelector({ jobId, currentContainerId, currentTransportMode, onSave }) {
  const [containers, setContainers] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedMode, setSelectedMode] = useState(currentTransportMode || 'SEA');
  const [selectedId, setSelectedId] = useState(currentContainerId || null);
  const [allowRotation, setAllowRotation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContainers();
  }, [selectedMode]);

  useEffect(() => {
    if (jobId) fetchRecommendation();
  }, [jobId, selectedMode]);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`api/containers?mode=${selectedMode}`);
      setContainers(response.data);
      
      // Clear selection if not in this mode
      if (!response.data.find(c => c.id === selectedId)) {
        setSelectedId(null);
      }
    } catch (err) {
      setError('Failed to load containers');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendation = async () => {
    try {
      const response = await api.get(`api/jobs/${jobId}/recommendation?mode=${selectedMode}`);
      setRecommendation(response.data);
      
      if (!selectedId && response.data.recommended) {
        setSelectedId(response.data.recommended.id);
      }
    } catch (err) {
      // Optional - no error needed
    }
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setSelectedId(null);
    setRecommendation(null);
  };

  const handleSave = async () => {
    if (!selectedId) {
      setError('Please select a container');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const response = await api.put(`api/jobs/${jobId}/container`, {
        containerId: selectedId,
        transportMode: selectedMode,
        allowRotation
      });
      
      onSave(response.data);
    } catch (err) {
      setError('Failed to save container selection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <TransportModeTabs 
        selectedMode={selectedMode} 
        onModeChange={handleModeChange} 
      />

      {/* Recommendation */}
      {recommendation?.recommended && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">💡 {recommendation.reason}</p>
          <p className="text-sm text-green-600 mt-1">
            Estimated utilization: ~{recommendation.utilization}%
          </p>
        </div>
      )}

      {/* Container Grid */}
      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading containers...</p>
      ) : (
        <ContainerGrid
          containers={containers}
          selectedId={selectedId}
          recommendedId={recommendation?.recommended?.id}
          onSelect={setSelectedId}
        />
      )}

      {/* Options */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="allowRotation"
          checked={allowRotation}
          onChange={(e) => setAllowRotation(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="allowRotation" className="text-gray-700">
          Allow item rotation
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !selectedId}
        className={`px-6 py-2 rounded-md text-white transition ${
          saving || !selectedId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saving ? 'Saving...' : 'Save Container Selection'}
      </button>
    </div>
  );
}

export default ContainerSelector;