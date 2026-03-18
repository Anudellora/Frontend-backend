import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const ROLE_LABELS = {
    user: '👤 Пользователь',
    seller: '🏪 Продавец',
    admin: '👑 Администратор',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const userRole = user?.role || 'user';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    ⬡ Practica9-10 <span>Tokens</span>
                </Link>
                {user && (
                    <div className="navbar-right">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => `btn btn-ghost btn-sm${isActive ? ' nav-active' : ''}`}
                        >
                            Товары
                        </NavLink>

                        {/* Только для администратора */}
                        {userRole === 'admin' && (
                            <>
                                <NavLink
                                    to="/users"
                                    className={({ isActive }) => `btn btn-ghost btn-sm${isActive ? ' nav-active' : ''}`}
                                >
                                    👥 Пользователи
                                </NavLink>
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) => `btn btn-ghost btn-sm${isActive ? ' nav-active' : ''}`}
                                >
                                    🔧 API Tester
                                </NavLink>
                            </>
                        )}

                        <div className="navbar-user">
                            <span className="navbar-user-dot" />
                            {user.first_name} {user.last_name}
                            <span style={{
                                fontSize: '0.68rem',
                                color: 'var(--text-muted)',
                                marginLeft: '0.35rem',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid var(--border)',
                                borderRadius: 4,
                                padding: '0.1rem 0.4rem'
                            }}>
                                {ROLE_LABELS[userRole] || userRole}
                            </span>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={logout}>
                            Выйти
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
