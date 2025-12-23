import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import LoadingSpinner from '../components/common/LoadingSpinner';
import JobForm from '../components/jobs/JobForm';
import JobList from '../components/jobs/JobList';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/jobs');
      setJobs(response.data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobName) => {
    try {
      const response = await api.post('/api/jobs', { name: jobName });
      setJobs([response.data, ...jobs]);
      toast.success(`Job "${response.data.name}" created!`);
    } catch (err) {
      toast.error('Failed to create job');
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) return <LoadingSpinner message="Loading jobs..." />;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Jobs</h1>
      
      <JobForm onSubmit={handleCreateJob} />
      <JobList jobs={jobs} onJobClick={handleJobClick} />
    </div>
  );
}

export default Jobs;