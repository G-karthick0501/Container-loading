import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    // 1. Get user and logout from AuthContext
    const { user, logout } = useAuth();
    
    // 2. Get navigate for redirect after logout
    const navigate = useNavigate();
    
    // 3. handleLogout function
    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login after logout
    };

    
    return (
        <div>
            <h2>Dashboard</h2>

            {/* Show user email */}
            <p>Welcome, {user?.email}</p>

            <button onClick={handleLogout}>Logout</button>

            {/* Logout button */}
            
        </div>
    );
}

export default Dashboard;