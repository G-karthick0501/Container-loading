import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import StatusBadge from '../components/common/StatusBadge';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [jobName, setJobName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    if (!jobName.trim()) return;

    try {
      const response = await api.post('/api/jobs', { name: jobName });
      setJobs([response.data, ...jobs]);
      setJobName('');
    } catch (err) {
      setError('Failed to create job');
    }
  };

  if (loading) return <LoadingSpinner message="Loading jobs..." />;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>

      <ErrorMessage message={error} />

      {/* Create Job Form */}
      <form onSubmit={createJob} className="mb-8 flex gap-4">
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Job name (e.g., Shipment to Mumbai)"
          className="px-4 py-2 border border-gray-300 rounded-md w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          + New Job
        </button>
      </form>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs yet. Create your first job above!</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
              >
                <td className="p-3 font-medium">{job.name}</td>
                <td className="p-3">
                  <StatusBadge status={job.status} />
                </td>
                <td className="p-3 text-gray-600">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Jobs;