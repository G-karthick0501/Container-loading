import { useState, useEffect } from 'react';
import api from '../services/api';

function useItems(jobId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get(`api/jobs/${jobId}/items`);
        setItems(response.data);
      } catch (err) {
        setError('Failed to fetch items.');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [jobId]);

  const addItem = async (itemData) => {
    try {
      const response = await api.post(`api/jobs/${jobId}/items`, itemData);
      setItems((prevItems) => [...prevItems, response.data]);
    } catch (err) {
      setError('Failed to add item.');
    }
  };
  const deleteItem = async (itemId) => {
    try {
      await api.delete(`api/jobs/${jobId}/items/${itemId}`);
      setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  const updateItem = async (itemId, updatedData) => {
    try {
      const response = await api.put(`api/jobs/${jobId}/items/${itemId}`, updatedData);
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === itemId ? response.data : item))
      );
    } catch (err) {
      setError('Failed to update item.');
    }
  };

  const uploadCsv = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`api/jobs/${jobId}/items/csv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setItems(response.data.items);
      //setItems((prevItems) => [...prevItems, ...response.data]);
    } catch (err) {
      setError('Failed to upload CSV.');
    }
  };

  return {
    items,
    loading,
    error,
    addItem,
    deleteItem,
    updateItem,
    uploadCsv,
  };
}

export default useItems;