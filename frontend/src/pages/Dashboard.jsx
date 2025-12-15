import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.email}
        </h2>
        <p className="text-gray-600">
          Manage your container loading jobs from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/jobs" 
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            📦 My Jobs
          </h3>
          <p className="text-gray-600">
            View and manage your container loading jobs
          </p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;