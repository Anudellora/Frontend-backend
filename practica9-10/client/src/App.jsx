import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/AuthContext';
import { useToast } from './hooks/useToast';

import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import AdminPage from './pages/AdminPage';

function AppRoutes({ addToast }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner-wrap" style={{ height: '100vh' }}><div className="spinner" /></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage addToast={addToast} />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage addToast={addToast} />} />

      <Route path="/" element={<ProtectedRoute><ProductsPage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute><ProductCreatePage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductDetailPage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute><ProductEditPage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { toasts, addToast } = useToast();

  return (
    <BrowserRouter>
      <Navbar />
      <AppRoutes addToast={addToast} />
      <Toast toasts={toasts} />
    </BrowserRouter>
  );
}
