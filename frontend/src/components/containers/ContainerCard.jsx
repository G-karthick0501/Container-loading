function ContainerCard({ container, selected, recommended, onSelect }) {
  return (
    <div
      onClick={() => onSelect(container.id)}
      className={`
        relative p-4 border-2 rounded-lg cursor-pointer transition
        ${selected 
          ? 'border-blue-600 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      {recommended && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Recommended
        </span>
      )}
      
      <h4 className="font-semibold text-gray-800">{container.name}</h4>
      <p className="text-sm text-gray-500">{container.code}</p>
      
      <div className="mt-2 text-sm text-gray-600">
        <p>{(container.length / 1000).toFixed(1)}m × {(container.width / 1000).toFixed(1)}m × {(container.height / 1000).toFixed(1)}m</p>
        <p className="font-medium">{container.volume} m³</p>
      </div>
      
      <p className="mt-1 text-xs text-gray-400">
        Max: {(container.maxWeight / 1000).toFixed(1)} tons
      </p>
    </div>
  );
}

export default ContainerCard;