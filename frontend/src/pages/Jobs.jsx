import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [jobName, setJobName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch jobs on page load
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load jobs');
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

  if (loading) return <p>Loading jobs...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Jobs</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Create Job Form */}
      <form onSubmit={createJob} style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Job name (e.g., Shipment to Mumbai)"
          style={{ padding: '0.5rem', width: '300px', marginRight: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          + New Job
        </button>
      </form>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <p>No jobs yet. Create your first job above!</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: '1px solid #eee',cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                <td style={{ padding: '0.5rem' }}>{job.name}</td>
                <td style={{ padding: '0.5rem' }}>
                  <span style={{
                    background: job.status === 'DRAFT' ? '#ffc107' : '#28a745',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem'
                  }}>
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: '0.5rem' }}>
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