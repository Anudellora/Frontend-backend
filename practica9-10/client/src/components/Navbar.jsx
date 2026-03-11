import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

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
                        <NavLink
                            to="/admin"
                            className={({ isActive }) => `btn btn-ghost btn-sm${isActive ? ' nav-active' : ''}`}
                        >
                            🔧 API Tester
                        </NavLink>
                        <div className="navbar-user">
                            <span className="navbar-user-dot" />
                            {user.first_name} {user.last_name}
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
