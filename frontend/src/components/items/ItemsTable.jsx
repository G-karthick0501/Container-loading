function ItemsTable({ 
  items, 
  editingItem, 
  onEditClick, 
  onEditChange, 
  onEditSave, 
  onEditCancel, 
  onDelete 
}) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No items yet. Add your first item below.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">L × W × H (mm)</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Weight (kg)</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Qty</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr 
              key={item.id} 
              className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              {editingItem && editingItem.id === item.id ? (
                // Edit Mode
                <>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => onEditChange('name', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={editingItem.length}
                        onChange={(e) => onEditChange('length', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">×</span>
                      <input
                        type="number"
                        value={editingItem.width}
                        onChange={(e) => onEditChange('width', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">×</span>
                      <input
                        type="number"
                        value={editingItem.height}
                        onChange={(e) => onEditChange('height', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={editingItem.weight}
                      onChange={(e) => onEditChange('weight', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => onEditChange('quantity', e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={onEditSave}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                      >
                        Save
                      </button>
                      <button 
                        onClick={onEditCancel}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                // View Mode
                <>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.length} × {item.width} × {item.height}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.weight}</td>
                  <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onEditClick(item)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ItemsTable;