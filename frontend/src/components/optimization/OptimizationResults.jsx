import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileCode } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { formatExportData, downloadJSON, downloadPDF } from '../../utils/exportUtils';

const algorithmNames = {
  'ffd': 'First Fit Decreasing',
  'extreme-points': 'Extreme Points',
  'genetic': 'Genetic Algorithm'
};

const algorithmIcons = {
  'ffd': '📦',
  'extreme-points': '📐',
  'genetic': '🧬'
};

function OptimizationResults({ job, items, result, prediction, mlRecommendation }) {
  const handleExportJSON = () => {
    const exportData = formatExportData(job, items, result);
    const filename = `${job.name.replace(/\s+/g, '_')}_load_plan.json`;
    downloadJSON(exportData, filename);
    toast.success('JSON exported!');
  };

  const handleExportPDF = () => {
    downloadPDF(job, items, result);
    toast.success('PDF exported!');
  };

  const usedAlgorithm = result.algorithm || result.stats?.algorithm;
  const mlWasUsed = mlRecommendation && !mlRecommendation.fallback;
  const predictionAccuracy = prediction 
    ? Math.abs(result.stats.utilization - (prediction.prediction * 100)).toFixed(1)
    : null;

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border">
      {/* ML Selection Summary - only if ML was used */}
      {mlWasUsed && (
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-1">
            <span>🤖</span>
            <span className="text-sm font-medium text-purple-800">ML-Powered Optimization</span>
          </div>
          <p className="text-sm text-gray-600">
            Selected <strong>{algorithmIcons[mlRecommendation.algorithm]} {algorithmNames[mlRecommendation.algorithm]}</strong> 
            {' '}with {Math.round(mlRecommendation.confidence * 100)}% confidence
          </p>
        </div>
      )}

      <h4 className="font-semibold mb-2">Results</h4>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p>Algorithm Used:</p>
        <p className="flex items-center gap-1">
          {algorithmIcons[usedAlgorithm]} {algorithmNames[usedAlgorithm] || usedAlgorithm}
        </p>
        
        <p>Total Items:</p>
        <p>{result.stats.totalItems}</p>
        
        <p>Placed:</p>
        <p className="text-green-600">{result.stats.placedCount}</p>
        
        <p>Couldn't fit:</p>
        <p className={result.stats.unplacedCount > 0 ? 'text-red-600' : ''}>
          {result.stats.unplacedCount}
        </p>
        
        <p>Utilization:</p>
        <p className="font-semibold text-lg">{result.stats.utilization}%</p>
        
        {prediction && (
          <>
            <p>ML Predicted:</p>
            <p className="text-purple-600 flex items-center gap-2">
              {Math.round(prediction.prediction * 100)}%
              {predictionAccuracy && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  parseFloat(predictionAccuracy) <= 3 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {parseFloat(predictionAccuracy) <= 3 ? '✓' : '~'} {predictionAccuracy}% off
                </span>
              )}
            </p>
          </>
        )}
      </div>

      {/* Elapsed time */}
      {result.elapsed && (
        <p className="text-xs text-gray-500 mb-4">
          Completed in {result.elapsed}
        </p>
      )}

      <div className="pt-4 border-t flex gap-4">
        <button
          onClick={handleExportJSON}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <FontAwesomeIcon icon={faFileCode} className="mr-2" />
          Export JSON
        </button>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
          Export PDF
        </button>
      </div>
    </div>
  );
}

export default OptimizationResults;