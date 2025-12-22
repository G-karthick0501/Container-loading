import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileCode } from '@fortawesome/free-solid-svg-icons';

import ContainerViewer from '../visualization/ContainerViewer';
import { formatExportData, downloadJSON, downloadPDF } from '../../utils/exportUtils';

function OptimizationSection({ job, items, onOptimize }) {
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const handleOptimize = async () => {
    try {
      setOptimizing(true);
      setOptimizationResult(null);
      const result = await onOptimize(); // Parent passes the API call
      setOptimizationResult(result);
    } catch (err) {
      alert(err.message || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = formatExportData(job, items, optimizationResult);
    const filename = `${job.name.replace(/\s+/g, '_')}_load_plan.json`;
    downloadJSON(exportData, filename);
  };

  const handleExportPDF = () => {
    downloadPDF(job, items, optimizationResult);
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="bg-green-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        {job.status === 'READY' ? '✅ Ready to Optimize' : '📦 Optimization Complete'}
      </h3>
      <p className="text-green-700 mb-4">
        {totalQuantity} items → {job.container?.name || 'Custom container'}
      </p>

      {/* Optimize Button */}
      {job.status === 'READY' && (
        <button
          className={`px-6 py-2 rounded-md text-white transition ${
            optimizing ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
          onClick={handleOptimize}
          disabled={optimizing}
        >
          {optimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
      )}

      {/* Results */}
      {optimizationResult && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold mb-2">Results</h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <p>Total Items:</p>
            <p>{optimizationResult.stats.totalItems}</p>
            <p>Placed:</p>
            <p className="text-green-600">{optimizationResult.stats.placedCount}</p>
            <p>Couldn't fit:</p>
            <p className={optimizationResult.stats.unplacedCount > 0 ? 'text-red-600' : ''}>
              {optimizationResult.stats.unplacedCount}
            </p>
            <p>Utilization:</p>
            <p className="font-semibold">{optimizationResult.stats.utilization}%</p>
          </div>

          {/* Export Buttons */}
          <div className="pt-4 border-t flex gap-4">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <FontAwesomeIcon icon={faFileCode} /> Export JSON
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              <FontAwesomeIcon icon={faFilePdf} /> Export PDF
            </button>
          </div>
        </div>
      )}

      {/* 3D Visualization */}
      {optimizationResult && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">3D View</h4>
          <ContainerViewer
            container={job.container}
            placements={optimizationResult.placements}
            items={items}
          />
        </div>
      )}
    </section>
  );
}

export default OptimizationSection;