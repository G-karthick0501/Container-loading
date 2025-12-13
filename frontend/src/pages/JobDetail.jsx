import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function JobDetail() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [newItemName, setNewItemName] = useState({
    name: '',
    length: '',
    width: '',
    height: '',
    weight: '',
    quantity: 1
  });

  useEffect(() => {
    fetchJobData();
  }, [jobId]);

  const fetchJobData = async () => {
    try {
      // 1. Fetch job details
      const jobResponse = await api.get(`api/jobs/${jobId}`);
      setJob(jobResponse.data);

      // 2. Fetch items for this job
      const itemsResponse = await api.get(`api/jobs/${jobId}/items`);
      setItems(itemsResponse.data);

      setLoading(false);
    } catch (err) {
      setError('Failed to load job');
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`api/jobs/${jobId}/items`, {
        name: newItemName.name,
        length: parseFloat(newItemName.length),
        width: parseFloat(newItemName.width),
        height: parseFloat(newItemName.height),
        weight: parseFloat(newItemName.weight),
        quantity: parseInt(newItemName.quantity)
      });

      setItems([response.data, ...items]);
        setNewItemName({
            name: '',
            length: '',
            width: '',
            height: '',
            weight: '',
            quantity: 1
        });
    } catch (err) {
      setError('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId) => {
  if (!window.confirm('Are you sure you want to delete this item?')) {
    return;
  }

  try {
    await api.delete(`api/jobs/${jobId}/items/${itemId}`);
    // Remove from state
    setItems(items.filter(item => item.id !== itemId));
  } catch (err) {
    setError('Failed to delete item');
  }
};

  const handleEditClick = (item) => {
  setEditingItem({ ...item });
};

const handleEditChange = (field, value) => {
  setEditingItem({ ...editingItem, [field]: value });
};

const handleEditSave = async () => {
  try {
    const response = await api.put(`api/jobs/${jobId}/items/${editingItem.id}`, {
      name: editingItem.name,
      length: parseFloat(editingItem.length),
      width: parseFloat(editingItem.width),
      height: parseFloat(editingItem.height),
      weight: parseFloat(editingItem.weight),
      quantity: parseInt(editingItem.quantity)
    });

    // Update in state
    setItems(items.map(item => 
      item.id === editingItem.id ? response.data : item
    ));
    setEditingItem(null);
  } catch (err) {
    setError('Failed to update item');
  }
};

const handleEditCancel = () => {
  setEditingItem(null);
};  

const handleCsvUpload = async () => {
  if (!csvFile) {
    setError('Please select a CSV file');
    return;
  }

  setUploading(true);
  setError('');

  try {
    // FormData is required for file uploads
    const formData = new FormData();
    formData.append('file', csvFile);

    const response = await api.post(`api/jobs/${jobId}/items/csv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Update items with response
    setItems(response.data.items);
    setCsvFile(null);
    
    // Reset file input
    document.getElementById('csv-input').value = '';
    
  } catch (err) {
    setError(err.response?.data?.error || 'Failed to upload CSV');
  } finally {
    setUploading(false);
  }
};

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!job) return <p>Job not found</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
    {/* Back button - styled as button */}
    <Link 
      to="/jobs"
      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition mb-6"
    >
      ← Back to Jobs
    </Link>

    {/* Job header */}
    <div className="flex items-center gap-4 mb-6">
      <h1 className="text-3xl font-bold">{job.name}</h1>
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        job.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
        job.status === 'READY' ? 'bg-blue-100 text-blue-800' :
        job.status === 'RUNNING' ? 'bg-purple-100 text-purple-800' :
        job.status === 'COMPLETE' ? 'bg-green-100 text-green-800' :
        job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {job.status}
      </span>
    </div>

      <hr style={{ margin: '2rem 0' }} />

      {/* Items section */}
      <h2>Items ({items.length})</h2>

      {/* CSV Upload Section */}
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
      onClick={handleCsvUpload}
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

      {items.length === 0 ? (
        <p>No items yet. Add your first item below.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>L × W × H (mm)</th>
              <th style={{ padding: '0.5rem' }}>Weight (kg)</th>
              <th style={{ padding: '0.5rem' }}>Qty</th>
              <th style={{ padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
  {items.map((item) => (
    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
      {editingItem && editingItem.id === item.id ? (
        // Edit mode
        <>
          <td style={{ padding: '0.5rem' }}>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) => handleEditChange('name', e.target.value)}
              style={{ width: '80px', padding: '0.25rem' }}
            />
          </td>
          <td style={{ padding: '0.5rem' }}>
            <input
              type="number"
              value={editingItem.length}
              onChange={(e) => handleEditChange('length', e.target.value)}
              style={{ width: '50px', padding: '0.25rem' }}
            /> × 
            <input
              type="number"
              value={editingItem.width}
              onChange={(e) => handleEditChange('width', e.target.value)}
              style={{ width: '50px', padding: '0.25rem' }}
            /> × 
            <input
              type="number"
              value={editingItem.height}
              onChange={(e) => handleEditChange('height', e.target.value)}
              style={{ width: '50px', padding: '0.25rem' }}
            />
          </td>
          <td style={{ padding: '0.5rem' }}>
            <input
              type="number"
              value={editingItem.weight}
              onChange={(e) => handleEditChange('weight', e.target.value)}
              style={{ width: '50px', padding: '0.25rem' }}
            />
          </td>
          <td style={{ padding: '0.5rem' }}>
            <input
              type="number"
              value={editingItem.quantity}
              onChange={(e) => handleEditChange('quantity', e.target.value)}
              style={{ width: '50px', padding: '0.25rem' }}
            />
          </td>
          <td style={{ padding: '0.5rem' }}>
            <button onClick={handleEditSave} style={{ marginRight: '0.5rem', color: 'green' }}>Save</button>
            <button onClick={handleEditCancel}>Cancel</button>
          </td>
        </>
      ) : (
        // View mode
        <>
          <td style={{ padding: '0.5rem' }}>{item.name}</td>
          <td style={{ padding: '0.5rem' }}>{item.length} × {item.width} × {item.height}</td>
          <td style={{ padding: '0.5rem' }}>{item.weight}</td>
          <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
          <td style={{ padding: '0.5rem' }}>
            <button style={{ marginRight: '0.5rem' }} onClick={() => handleEditClick(item)}>Edit</button>
            <button style={{ color: 'red' }} onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </td>
        </>
      )}
    </tr>
  ))}
</tbody>
        </table>
      )}

      <h3 style={{ marginTop: '2rem' }}>Add New Item</h3>
        <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Item Name"
            value={newItemName.name}
            onChange={(e) => setNewItemName({ ...newItemName, name: e.target.value })}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            type="number"
            placeholder="Length (mm)"
            value={newItemName.length}
            onChange={(e) => setNewItemName({ ...newItemName, length: e.target.value })}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            type="number"
            placeholder="Width (mm)"
            value={newItemName.width}
            onChange={(e) => setNewItemName({ ...newItemName, width: e.target.value })}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            type="number"
            placeholder="Height (mm)"
            value={newItemName.height}
            onChange={(e) => setNewItemName({ ...newItemName, height: e.target.value })}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={newItemName.weight}
            onChange={(e) => setNewItemName({ ...newItemName, weight: e.target.value })}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            type="number"
            placeholder="Quantity"
            value={newItemName.quantity}
            onChange={(e) => setNewItemName({ ...newItemName, quantity: e.target.value })}
            required
            style={{ padding: '0.5rem', width: '100px' }}
            min="1"
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + Add Item
            </button>
        </form>

      

    </div>
  );
}

export default JobDetail;