import { useState } from 'react';
import Button from '../common/Button';

function AddItemForm({ onAdd }) {
  const [newItem, setNewItem] = useState({
    name: '', length: '', width: '', height: '', weight: '', quantity: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAdd({
      name: newItem.name,
      length: parseFloat(newItem.length),
      width: parseFloat(newItem.width),
      height: parseFloat(newItem.height),
      weight: parseFloat(newItem.weight),
      quantity: parseInt(newItem.quantity)
    });
    setNewItem({ name: '', length: '', width: '', height: '', weight: '', quantity: 1 });
  };

  return (
    <>
      <h3 style={{ marginTop: '2rem' }}>Add New Item</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
          style={{ padding: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Length (mm)"
          value={newItem.length}
          onChange={(e) => setNewItem({ ...newItem, length: e.target.value })}
          required
          style={{ padding: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Width (mm)"
          value={newItem.width}
          onChange={(e) => setNewItem({ ...newItem, width: e.target.value })}
          required
          style={{ padding: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Height (mm)"
          value={newItem.height}
          onChange={(e) => setNewItem({ ...newItem, height: e.target.value })}
          required
          style={{ padding: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Weight (kg)"
          value={newItem.weight}
          onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
          required
          style={{ padding: '0.5rem' }}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          required
          style={{ padding: '0.5rem', width: '100px' }}
          min="1"
        />
        <Button type="submit" variant="primary">+ Add Item</Button>
      </form>
    </>
  );
}

export default AddItemForm;