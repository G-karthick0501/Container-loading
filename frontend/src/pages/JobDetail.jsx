import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

import CsvUpload from '../components/items/CsvUpload';
import AddItemForm from '../components/items/AddItemForm';
import ItemsTable from '../components/items/ItemsTable';
import ContainerSelector from '../components/containers/ContainerSelector';

import useItems from '../hooks/useItems';

function JobDetail() {
  const { jobId } = useParams();
  
  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  
  const { items, loading: itemsLoading, error, addItem, deleteItem, updateItem, uploadCsv } = useItems(jobId);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`api/jobs/${jobId}`);
        setJob(response.data);
        // Load existing placements if job is COMPLETE
        if (response.data.status === 'COMPLETE' && response.data.placements?.length > 0) {
          const placements = response.data.placements;
          const placedCount = placements.filter(p => p.placed).length;
          const unplacedCount = placements.filter(p => !p.placed).length;
          const placedVolume = placements
            .filter(p => p.placed)
            .reduce((sum, p) => sum + (p.placedLength * p.placedWidth * p.placedHeight), 0) / 1e9;
          
          setOptimizationResult({
            stats: {
              totalItems: placements.length,
              placedCount,
              unplacedCount,
              placedVolume,
              utilization: Math.round((placedVolume / (response.data.container?.volume || 1)) * 1000) / 10
            },
            placements
          });
        }
      } finally {
        setJobLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleEditClick = (item) => setEditingItem({ ...item });
  const handleEditCancel = () => setEditingItem(null);
  const handleEditChange = (field, value) => setEditingItem({ ...editingItem, [field]: value });

  const handleEditSave = async () => {
    await updateItem(editingItem.id, {
      name: editingItem.name,
      length: parseFloat(editingItem.length),
      width: parseFloat(editingItem.width),
      height: parseFloat(editingItem.height),
      weight: parseFloat(editingItem.weight),
      quantity: parseInt(editingItem.quantity)
    });
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure?')) return;
    await deleteItem(itemId);
  };

  const handleContainerSave = (updatedJob) => {
    setJob(updatedJob);
  };

  const handleOptimize = async () => {
  try {
    setOptimizing(true);
    setOptimizationResult(null);
    
    const response = await api.post(`api/jobs/${jobId}/optimize`);
    
    setOptimizationResult(response.data);
    setJob({ ...job, status: 'COMPLETE' });
  } catch (err) {
    alert(err.response?.data?.error || 'Optimization failed');
  } finally {
    setOptimizing(false);
  }
};

  if (jobLoading || itemsLoading) return <LoadingSpinner message="Loading job..." />;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <ErrorMessage message={error} />
      
      <Link 
        to="/jobs"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition mb-6"
      >
        ← Back to Jobs
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{job.name}</h1>
        <StatusBadge status={job.status} />
      </div>

      {/* Items Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Items ({items.length})</h2>
        
        <CsvUpload onUpload={uploadCsv} />
        
        <ItemsTable
          items={items}
          editingItem={editingItem}
          onEditClick={handleEditClick}
          onEditChange={handleEditChange}
          onEditSave={handleEditSave}
          onEditCancel={handleEditCancel}
          onDelete={handleDeleteItem}
        />

        <AddItemForm onAdd={addItem} />
      </section>

      {/* Container Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Container Selection</h2>
        
        {items.length === 0 ? (
          <p className="text-gray-500">Add items first to get container recommendations.</p>
        ) : (
          <ContainerSelector
            jobId={jobId}
            currentContainerId={job.containerId}
            onSave={handleContainerSave}
          />
        )}
      </section>

      {/* Ready Status */}
      {/* Optimization Section */}
{(job.status === 'READY' || job.status === 'COMPLETE') && (
  <section className="bg-green-50 border border-green-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-green-800 mb-2">
      {job.status === 'READY' ? '✅ Ready to Optimize' : '📦 Optimization Complete'}
    </h3>
    <p className="text-green-700 mb-4">
      {items.reduce((sum, item) => sum + item.quantity, 0)} items → {job.container?.name || 'Custom container'}
    </p>
    
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

    {optimizationResult && (
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <h4 className="font-semibold mb-2">Results</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
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
      </div>
    )}
  </section>
)}
    </div>
  );
}

export default JobDetail;