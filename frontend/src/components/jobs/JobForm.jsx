import { useState } from 'react';

function JobForm({ onSubmit }) {
  const [jobName, setJobName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobName.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(jobName);
    setJobName('');
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Job</h2>
      <form onSubmit={handleSubmit} className="flex gap-4">
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Job name (e.g., Shipment to Mumbai)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || !jobName.trim()}
          className={`px-6 py-2 rounded-md text-white font-medium transition ${
            isSubmitting || !jobName.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Creating...' : '+ New Job'}
        </button>
      </form>
    </div>
  );
}

export default JobForm;