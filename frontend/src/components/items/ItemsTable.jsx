import Button from '../common/Button';

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
    return <p>No items yet. Add your first item below.</p>;
  }

  return (
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
              <>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => onEditChange('name', e.target.value)}
                    style={{ width: '80px', padding: '0.25rem' }}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    value={editingItem.length}
                    onChange={(e) => onEditChange('length', e.target.value)}
                    style={{ width: '50px', padding: '0.25rem' }}
                  /> × 
                  <input
                    type="number"
                    value={editingItem.width}
                    onChange={(e) => onEditChange('width', e.target.value)}
                    style={{ width: '50px', padding: '0.25rem' }}
                  /> × 
                  <input
                    type="number"
                    value={editingItem.height}
                    onChange={(e) => onEditChange('height', e.target.value)}
                    style={{ width: '50px', padding: '0.25rem' }}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    value={editingItem.weight}
                    onChange={(e) => onEditChange('weight', e.target.value)}
                    style={{ width: '50px', padding: '0.25rem' }}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <input
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => onEditChange('quantity', e.target.value)}
                    style={{ width: '50px', padding: '0.25rem' }}
                  />
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <button onClick={onEditSave} style={{ marginRight: '0.5rem', color: 'green' }}>Save</button>
                  <button onClick={onEditCancel}>Cancel</button>
                </td>
              </>
            ) : (
              <>
                <td style={{ padding: '0.5rem' }}>{item.name}</td>
                <td style={{ padding: '0.5rem' }}>{item.length} × {item.width} × {item.height}</td>
                <td style={{ padding: '0.5rem' }}>{item.weight}</td>
                <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem' }}>
                  <button style={{ marginRight: '0.5rem' }} onClick={() => onEditClick(item)}>Edit</button>
                  <button style={{ color: 'red' }} onClick={() => onDelete(item.id)}>Delete</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ItemsTable;