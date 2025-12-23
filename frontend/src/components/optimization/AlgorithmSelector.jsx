const ALGORITHMS = [
  { 
    id: 'auto', 
    name: 'Auto (Best)', 
    icon: '🎯',
    description: 'Runs all and picks best result',
    premium: false
  },
  { 
    id: 'extreme-points', 
    name: 'Extreme Points', 
    icon: '📐',
    description: 'Fast & efficient',
    premium: false
  },
  { 
    id: 'ffd', 
    name: 'First Fit', 
    icon: '📦',
    description: 'Simple baseline',
    premium: false
  },
  { 
    id: 'genetic', 
    name: 'Genetic Algorithm', 
    icon: '🧬',
    description: 'Best results, slower (~30-60s)',
    premium: true
  }
];

function AlgorithmSelector({ selected, onChange, disabled }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Algorithm
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {ALGORITHMS.map((algo) => (
          <button
            key={algo.id}
            onClick={() => onChange(algo.id)}
            disabled={disabled}
            className={`
              p-3 rounded-lg border-2 text-left transition
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${selected === algo.id
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{algo.icon}</span>
              <span className="font-medium text-sm">{algo.name}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{algo.description}</p>
            {algo.premium && (
              <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                ⭐ Premium
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default AlgorithmSelector;