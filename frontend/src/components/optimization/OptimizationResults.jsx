import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileCode } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import { formatExportData, downloadJSON, downloadPDF } from '../../utils/exportUtils';

function OptimizationResults({ job, items, result, prediction }) {
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

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border">
      <h4 className="font-semibold mb-2">Results</h4>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p>Total Items:</p>
        <p>{result.stats.totalItems}</p>
        
        <p>Placed:</p>
        <p className="text-green-600">{result.stats.placedCount}</p>
        
        <p>Couldn't fit:</p>
        <p className={result.stats.unplacedCount > 0 ? 'text-red-600' : ''}>
          {result.stats.unplacedCount}
        </p>
        
        <p>Utilization:</p>
        <p className="font-semibold">{result.stats.utilization}%</p>
        
        {prediction && (
          <>
            <p>AI Predicted:</p>
            <p className="text-purple-600">{Math.round(prediction.prediction * 100)}%</p>
          </>
        )}
      </div>

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