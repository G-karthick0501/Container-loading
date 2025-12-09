import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate,Link } from 'react-router-dom';

function Login() {
    // 1. Create state for email, password, error
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    
    // 2. Get login function from AuthContext
    const { login } = useAuth();
    
    // 3. Get navigate function for redirect
    const navigate = useNavigate();
    
    // 4. handleSubmit function (we'll do this next)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard'); // Redirect to dashboard on success
        } catch (err) {
            setError('Invalid email or password');
        }
    };
    
    return (
        <div>
            <h2>Login</h2>

            {/* Form will go here */}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
    );
}

export default Login;