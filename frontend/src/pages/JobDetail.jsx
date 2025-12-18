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

  // Optimization state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [optimizationError, setOptimizationError] = useState('');

  const { items, loading: itemsLoading, error, addItem, deleteItem, updateItem, uploadCsv } = useItems(jobId);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`api/jobs/${jobId}`);
        setJob(response.data);

        // If job is COMPLETE or FAILED, fetch results
        if (['COMPLETE', 'FAILED'].includes(response.data.status)) {
          fetchResults();
        }
      } finally {
        setJobLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const fetchResults = async () => {
    try {
      const response = await api.get(`api/jobs/${jobId}/results`);
      if (response.data.hasResults) {
        setOptimizationResults(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

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
    setOptimizationResults(null); // Clear old results when container changes
  };

  const handleRunOptimization = async () => {
    setOptimizing(true);
    setOptimizationError('');

    try {
      const response = await api.post(`api/jobs/${jobId}/optimize`);
      setOptimizationResults(response.data);
      setJob(prev => ({ ...prev, status: response.data.status }));
    } catch (err) {
      setOptimizationError(err.response?.data?.error || 'Optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleResetOptimization = async () => {
    if (!window.confirm('This will clear all placement results. Continue?')) return;

    try {
      const response = await api.post(`api/jobs/${jobId}/reset`);
      setJob(response.data.job);
      setOptimizationResults(null);
      setOptimizationError('');
    } catch (err) {
      setOptimizationError(err.response?.data?.error || 'Reset failed');
    }
  };

  if (jobLoading || itemsLoading) return <LoadingSpinner message="Loading job..." />;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <ErrorMessage message={error || optimizationError} />

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

      {/* Optimization Section */}
      {job.status === 'READY' && (
        <section className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ✅ Ready to Optimize
          </h3>
          <p className="text-green-700 mb-4">
            {items.length} items → {job.container?.name || 'Custom container'}
          </p>
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRunOptimization}
            disabled={optimizing}
          >
            {optimizing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running Optimization...
              </span>
            ) : (
              '🚀 Run Optimization'
            )}
          </button>
        </section>
      )}

      {/* Results Section */}
      {optimizationResults && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Optimization Results</h2>
            <button
              onClick={handleResetOptimization}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              🔄 Reset & Re-optimize
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{optimizationResults.statistics?.totalItems}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500">Placed</p>
              <p className="text-2xl font-bold text-green-600">{optimizationResults.statistics?.placedCount}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500">Not Placed</p>
              <p className="text-2xl font-bold text-red-600">{optimizationResults.statistics?.unplacedCount}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-gray-500">Volume Used</p>
              <p className="text-2xl font-bold text-blue-600">{optimizationResults.statistics?.volumeUtilization}%</p>
            </div>
          </div>

          {/* Status Banner */}
          {optimizationResults.status === 'COMPLETE' ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold">✅ All items successfully placed!</p>
            </div>
          ) : optimizationResults.status === 'FAILED' ? (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">
                ⚠️ {optimizationResults.statistics?.unplacedCount} item(s) could not be placed.
                Consider using a larger container or reducing items.
              </p>
            </div>
          ) : null}

          {/* Placements Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Item</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Position (X, Y, Z)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Dimensions (L×W×H)</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Rotated</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {optimizationResults.placements?.map((placement, index) => (
                  <tr key={placement.id || index} className={!placement.placed ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3">
                      {placement.item?.name || placement.itemName}
                      {placement.instanceIndex > 0 && ` (#${placement.instanceIndex + 1})`}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {placement.placed
                        ? `(${placement.x}, ${placement.y}, ${placement.z})`
                        : '—'
                      }
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {placement.placedLength} × {placement.placedWidth} × {placement.placedHeight}
                    </td>
                    <td className="px-4 py-3">
                      {placement.rotated ? '🔄 Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3">
                      {placement.placed ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Placed</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Not Placed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Container Info */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Container:</strong> {optimizationResults.container?.name}
              ({optimizationResults.container?.length} × {optimizationResults.container?.width} × {optimizationResults.container?.height} mm)
            </p>
          </div>
        </section>
      )}

      {/* Completed/Failed Status Display */}
      {['COMPLETE', 'FAILED'].includes(job.status) && !optimizationResults && (
        <section className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-600">Loading optimization results...</p>
        </section>
      )}
    </div>
  );
}

export default JobDetail;
