const TRANSPORT_MODES = [
  { mode: 'SEA', icon: '🚢', label: 'Sea Freight' },
  { mode: 'AIR', icon: '✈️', label: 'Air Cargo' },
  { mode: 'ROAD', icon: '🚛', label: 'Road Transport' }
];

function TransportModeTabs({ selectedMode, onModeChange }) {
  return (
    <div className="flex gap-2">
      {TRANSPORT_MODES.map(({ mode, icon, label }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition font-medium
            ${selectedMode === mode
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }
          `}
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default TransportModeTabs;