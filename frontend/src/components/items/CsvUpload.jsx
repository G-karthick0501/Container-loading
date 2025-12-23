import { useRef } from 'react';

function CsvUpload({ onUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-800">Import from CSV</p>
          <p className="text-sm text-blue-600">
            Format: name, length, width, height, weight, quantity
          </p>
        </div>
        <div>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            📁 Choose CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default CsvUpload;