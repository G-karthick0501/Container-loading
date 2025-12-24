import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

import OptimizationResults from './OptimizationResults';
import AlgorithmSelector from './AlgorithmSelector';
import ProgressBar from './ProgressBar';
import ContainerViewer from '../visualization/ContainerViewer';
import { useSocket } from '../../hooks/useSocket';

function OptimizationSection({ job, items, onOptimize }) {
  const [optimizing, setOptimizing] = useState(false);
  const [result, setResult] = useState(null);
  const [algorithm, setAlgorithm] = useState('extreme-points');
  
  const { connected, progress, resetProgress } = useSocket(job.id);

  // Handle WebSocket completion
  useEffect(() => {
    if (progress?.status === 'complete') {
      fetchResult();
    }
  }, [progress?.status]);

  const fetchResult = async () => {
    try {
      const response = await api.get(`api/jobs/${job.id}`);
      if (response.data.placements?.length > 0) {
        const placements = response.data.placements;
        const placedCount = placements.filter(p => p.placed).length;
        const placedVolume = placements
          .filter(p => p.placed)
          .reduce((sum, p) => sum + (p.placedLength * p.placedWidth * p.placedHeight) / 1e9, 0);
        
        const containerVolume = job.container 
          ? job.container.volume 
          : (job.customLength * job.customWidth * job.customHeight) / 1e9;

        setResult({
          placements,
          algorithm: response.data.algorithm,
          stats: {
            totalItems: placements.length,
            placedCount,
            unplacedCount: placements.length - placedCount,
            utilization: Math.round((placedVolume / containerVolume) * 1000) / 10
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch result:', err);
    }
  };

  const handleOptimize = async () => {
    resetProgress();
    const isGenetic = algorithm === 'genetic';
    
    if (!isGenetic) {
      toast.loading('Running optimization...', { id: 'optimize' });
    }
    
    try {
      setOptimizing(true);
      const response = await api.post(`api/jobs/${job.id}/optimize`, { algorithm });
      
      setResult(response.data);
      onOptimize({ ...job, status: 'COMPLETE' });
      
      toast.dismiss('optimize');
      toast.success(`Done! ${response.data.stats.utilization}% utilization using ${response.data.algorithm}`);
    } catch (err) {
      toast.dismiss('optimize');
      toast.error(err.response?.data?.error || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isReady = job.status === 'READY';
  const isGenetic = algorithm === 'genetic';

  return (
    <section className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-green-800">
          {isReady ? '✅ Ready to Optimize' : '📦 Optimization Complete'}
        </h3>
        {connected && (
          <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">
            🔌 Live
          </span>
        )}
      </div>
      <p className="text-green-700 mb-4">
        {totalQuantity} items → {job.container?.name || 'Custom container'}
      </p>

      {/* Algorithm Selector */}
      {isReady && !result && (
        <AlgorithmSelector
          selected={algorithm}
          onChange={setAlgorithm}
          disabled={optimizing}
        />
      )}

      {/* Progress Bar (for Genetic) */}
      {optimizing && isGenetic && (
        <ProgressBar progress={progress} />
      )}

      {/* Run Button */}
      {isReady && !result && (
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className={`px-6 py-2 rounded-md text-white transition ${
            optimizing
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {optimizing 
            ? (isGenetic ? 'Running Genetic Algorithm...' : 'Optimizing...') 
            : (algorithm === 'genetic' ? 'Run Genetic 🧬' : 'Run Optimization')
          }
        </button>
      )}

      {/* Results */}
      {result && (
        <OptimizationResults
          job={job}
          items={items}
          result={result}
        />
      )}

      {/* 3D Viewer */}
      {result && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">3D View</h4>
          <ContainerViewer
            container={job.container || {
              length: job.customLength,
              width: job.customWidth,
              height: job.customHeight
            }}
            placements={result.placements}
            items={items}
          />
        </div>
      )}
    </section>
  );
}

export default OptimizationSection;