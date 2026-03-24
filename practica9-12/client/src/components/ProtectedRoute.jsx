import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="spinner-wrap">
                <div className="spinner" />
            </div>
        );
    }

    // Если пользователь не авторизован — на логин
    if (!user) return <Navigate to="/login" replace />;

    // Если указаны допустимые роли и роль пользователя не входит в список
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}
