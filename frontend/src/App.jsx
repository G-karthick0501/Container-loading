    import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
    import { AuthProvider } from './context/AuthContext';
    import { Toaster } from 'react-hot-toast';
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
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
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