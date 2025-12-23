import JobCard from './JobCard';

function JobList({ jobs, onJobClick }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No jobs yet.</p>
        <p className="text-gray-400">Create your first job above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Name</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Created</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobCard 
              key={job.id} 
              job={job} 
              onClick={() => onJobClick(job.id)} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobList;