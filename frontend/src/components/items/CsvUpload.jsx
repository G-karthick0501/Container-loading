import { useState } from 'react';

function CsvUpload({ onUpload }) {
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    // TODO: 
    // 1. Check if file exists
        if(!csvFile)   return;
    // 2. Set uploading true
        setUploading(true);
    // 3. Call onUpload(csvFile)
        await onUpload(csvFile);
    // 4. Reset file state
        setCsvFile(null);
        document.getElementById('csv-input').value = '';
    // 5. Set uploading false
        setUploading(false);
  };

  return (
    // TODO: Move the JSX from JobDetail here
    <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
  <h3 className="text-sm font-medium text-gray-700 mb-2">Upload Items from CSV</h3>
  <div className="flex items-center gap-4">
    <input
      id="csv-input"
      type="file"
      accept=".csv"
      onChange={(e) => setCsvFile(e.target.files[0])}
      className="text-sm text-gray-600"
    />
    <button
      onClick={handleUpload}
      disabled={!csvFile || uploading}
      className={`px-4 py-2 rounded-md text-white ${
        !csvFile || uploading 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {uploading ? 'Uploading...' : 'Upload CSV'}
    </button>
  </div>
  <p className="text-xs text-gray-500 mt-2">
    CSV format: name, length, width, height, weight, quantity
  </p>
</div>

  );
}

export default CsvUpload;