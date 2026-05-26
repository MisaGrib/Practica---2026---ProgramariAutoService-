import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import MecanicDashboard from './pages/mecanic/MecanicDashboard';
import ClientDashboard from './pages/client/ClientDashboard';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={
            <ProtectedRoute role="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/mecanic/*" element={
            <ProtectedRoute role="Mecanic">
              <MecanicDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client/*" element={
            <ProtectedRoute role="Client">
              <ClientDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;