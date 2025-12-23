import { useState } from 'react';

function AddItemForm({ onAdd }) {
  const [newItem, setNewItem] = useState({
    name: '', length: '', width: '', height: '', weight: '', quantity: 1
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    await onAdd({
      name: newItem.name,
      length: parseFloat(newItem.length),
      width: parseFloat(newItem.width),
      height: parseFloat(newItem.height),
      weight: parseFloat(newItem.weight),
      quantity: parseInt(newItem.quantity)
    });
    setNewItem({ name: '', length: '', width: '', height: '', weight: '', quantity: 1 });
    setIsAdding(false);
  };

  return (
    <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Item</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input
            type="text"
            placeholder="e.g., Cardboard Box A"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Row 2: Dimensions */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Length (mm)</label>
            <input
              type="number"
              placeholder="500"
              value={newItem.length}
              onChange={(e) => setNewItem({ ...newItem, length: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width (mm)</label>
            <input
              type="number"
              placeholder="400"
              value={newItem.width}
              onChange={(e) => setNewItem({ ...newItem, width: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
            <input
              type="number"
              placeholder="300"
              value={newItem.height}
              onChange={(e) => setNewItem({ ...newItem, height: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Weight & Quantity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number"
              placeholder="10"
              value={newItem.weight}
              onChange={(e) => setNewItem({ ...newItem, weight: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              placeholder="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isAdding}
          className={`w-full py-2 rounded-md text-white font-medium transition ${
            isAdding 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isAdding ? 'Adding...' : '+ Add Item'}
        </button>
      </form>
    </div>
  );
}

export default AddItemForm;