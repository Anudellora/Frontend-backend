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
import UnauthorizedPage from './pages/UnauthorizedPage';
import UsersListPage from './pages/UsersListPage';

function AppRoutes({ addToast }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner-wrap" style={{ height: '100vh' }}><div className="spinner" /></div>;
  }

  return (
    <Routes>
      {/* Публичные маршруты (Гость) */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage addToast={addToast} />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage addToast={addToast} />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Просмотр товаров — Пользователь, Продавец, Администратор */}
      <Route path="/" element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']}><ProductsPage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']}><ProductDetailPage addToast={addToast} /></ProtectedRoute>} />

      {/* Создание/редактирование товаров — Продавец и Администратор */}
      <Route path="/products/new" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><ProductCreatePage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/products/:id/edit" element={<ProtectedRoute allowedRoles={['seller', 'admin']}><ProductEditPage addToast={addToast} /></ProtectedRoute>} />

      {/* Панель администратора — только Администратор */}
      <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersListPage addToast={addToast} /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>} />

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
