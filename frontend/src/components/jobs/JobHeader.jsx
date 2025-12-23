import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

function JobHeader({ job }) {
  return (
    <>
      <Link 
        to="/jobs"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition mb-6"
      >
        ← Back to Jobs
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{job.name}</h1>
        <StatusBadge status={job.status} />
      </div>
    </>
  );
}

export default JobHeader;