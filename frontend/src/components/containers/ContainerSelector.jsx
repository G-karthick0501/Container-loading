import { useState, useEffect } from 'react';
import api from '../../services/api';
import ContainerCard from './ContainerCard';

function ContainerSelector({ jobId, currentContainerId, onSave }) {
  const [containers, setContainers] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [selectedId, setSelectedId] = useState(currentContainerId || null);
  const [allowRotation, setAllowRotation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch containers and recommendation in parallel
      const [containersRes, recoRes] = await Promise.all([
        api.get('api/containers'),
        api.get(`api/jobs/${jobId}/recommendation`)
      ]);
      
      setContainers(containersRes.data);
      setRecommendation(recoRes.data);
      
      // If no container selected yet, pre-select recommended
      if (!currentContainerId && recoRes.data.recommended) {
        setSelectedId(recoRes.data.recommended.id);
      }
    } catch (err) {
      setError('Failed to load containers');
    } finally {
      setLoading(false);
    }
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
        allowRotation
      });
      
      onSave(response.data);
    } catch (err) {
      setError('Failed to save container selection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading containers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Recommendation Banner */}
      {recommendation?.recommended && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            💡 {recommendation.reason}
          </p>
          <p className="text-sm text-green-600 mt-1">
            Estimated utilization: ~{recommendation.utilization}%
          </p>
        </div>
      )}

      {/* Container Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {containers.map((container) => (
          <ContainerCard
            key={container.id}
            container={container}
            selected={selectedId === container.id}
            recommended={recommendation?.recommended?.id === container.id}
            onSelect={setSelectedId}
          />
        ))}
      </div>

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
          Allow item rotation (items can be rotated to fit better)
        </label>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !selectedId}
        className={`
          px-6 py-2 rounded-md text-white transition
          ${saving || !selectedId
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
          }
        `}
      >
        {saving ? 'Saving...' : 'Save Container Selection'}
      </button>
    </div>
  );
}

export default ContainerSelector;