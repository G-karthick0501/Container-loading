function ProgressBar({ progress }) {
  if (!progress) return null;

  const { status, generation, totalGenerations, bestFitness } = progress;
  const percent = progress.progress || 0;

  if (status === 'complete') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-xl">✅</span>
          <span className="font-medium">Optimization Complete!</span>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-red-700">
          <span className="text-xl">❌</span>
          <span className="font-medium">Optimization Failed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-spin">⚙️</span>
          <span className="font-medium text-purple-800">
            Genetic Algorithm Running...
          </span>
        </div>
        <span className="text-purple-600 font-mono">
          {percent}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-purple-200 rounded-full h-3 mb-2">
        <div
          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm text-purple-600">
        <span>Generation: {generation || 0} / {totalGenerations || 50}</span>
        <span>Best Fitness: {bestFitness || 0}%</span>
      </div>
    </div>
  );
}

export default ProgressBar; 