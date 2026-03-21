import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Registration';
import Dashboard from './pages/Dashboard';
import './App.css';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();
  
  console.log('AppRoutes - isAuthenticated:', isAuthenticated);
  console.log('AppRoutes - user:', user);

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          !isAuthenticated ? 
          <Login /> : 
          <Navigate to="/dashboard" />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated && user?.role === 1 ?
          <Register /> : 
          <Navigate to="/login" />
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated ? 
          <Dashboard /> : 
          <Navigate to="/login" />
        } 
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" />
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;