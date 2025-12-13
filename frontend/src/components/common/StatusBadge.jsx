function StatusBadge({ status }) {
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';

  const statusClasses = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    READY: 'bg-blue-100 text-blue-800',
    RUNNING: 'bg-purple-100 text-purple-800',
    COMPLETE: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

export default StatusBadge;