import { createContext, useContext, useEffect, useState } from "react";
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on page load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            if (token) {
                try {
                    const response = await api.get('/api/auth/me');
                    setUser(response.data);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { id, email: userEmail, token } = response.data;
            localStorage.setItem('token', token);
            setUser({ id, email: userEmail });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const signup = async (email, password) => {
        try {
            const response = await api.post('/api/auth/signup', { email, password });
            const { id, email: userEmail, token } = response.data;
            localStorage.setItem('token', token);
            setUser({ id, email: userEmail });
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = { user, loading, login, logout, signup };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;