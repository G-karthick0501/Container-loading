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
  
  const { items, loading: itemsLoading, error, addItem, deleteItem, updateItem, uploadCsv } = useItems(jobId);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`api/jobs/${jobId}`);
        setJob(response.data);
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
      {job.status === 'READY' && (
        <section className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Ready to Optimize
          </h3>
          <p className="text-green-700 mb-4">
            {items.length} items → {job.container?.name || 'Custom container'}
          </p>
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            onClick={() => alert('Phase 4 will add optimization!')}
          >
            Run Optimization
          </button>
        </section>
      )}
    </div>
  );
}

export default JobDetail;