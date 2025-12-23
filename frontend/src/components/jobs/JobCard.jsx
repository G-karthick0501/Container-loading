import StatusBadge from '../common/StatusBadge';

function JobCard({ job, onClick }) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition"
    >
      <td className="px-4 py-3 font-medium text-gray-900">{job.name}</td>
      <td className="px-4 py-3">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-4 py-3 text-gray-600">
        {new Date(job.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );
}

export default JobCard;