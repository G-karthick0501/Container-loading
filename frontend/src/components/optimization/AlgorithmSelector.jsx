const ALGORITHMS = [
  { 
    id: 'extreme-points', 
    name: 'Extreme Points', 
    icon: '📐',
    description: 'Fast & efficient (88-94%)'
  },
  { 
    id: 'ffd', 
    name: 'First Fit', 
    icon: '📦',
    description: 'Simple baseline (70-80%)'
  },
  { 
    id: 'genetic', 
    name: 'Genetic Algorithm', 
    icon: '🧬',
    description: 'Best results, slower (~30s)'
  }
];

function AlgorithmSelector({ selected, onChange, disabled }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Algorithm
      </label>
      <div className="grid grid-cols-3 gap-2">
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
          </button>
        ))}
      </div>
    </div>
  );
}

export default AlgorithmSelector;