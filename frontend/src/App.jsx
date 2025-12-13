    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { AuthProvider } from './context/AuthContext';
    import Login from './pages/Login';
    import Signup from './pages/Signup';
    import Dashboard from './pages/Dashboard';
    import Jobs from './pages/Jobs';
    import ProtectedRoute from './components/ProtectedRoute';
    import Layout from './components/Layout';
    import JobDetail from './pages/JobDetail';

    function App() {
    return (
        <AuthProvider>
        <BrowserRouter>
            <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/dashboard"
                element={
                <ProtectedRoute>
                    <Layout>
                    <Dashboard />
                    </Layout>
                </ProtectedRoute>
                }
            />
            <Route
                path="/jobs"
                element={
                <ProtectedRoute>
                    <Layout>
                    <Jobs />
                    </Layout>
                </ProtectedRoute>
                }
            />
            <Route
                path="/jobs/:jobId"
                element={
                    <ProtectedRoute>
                        <Layout>
                        <JobDetail />
                        </Layout>
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
        </AuthProvider>
    );
    }

    export default App;