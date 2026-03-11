import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function LoginPage({ addToast }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            addToast(`Добро пожаловать, ${user.first_name}! 👋`, 'success');
            navigate('/');
        } catch (err) {
            addToast(err.response?.data?.message || 'Неверный email или пароль', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Вход в систему</h1>
                <p className="subtitle">Войдите в аккаунт для управления товарами</p>
                <div className="auth-hint">
                    <strong>Демо:</strong> demo@test.com / demo1234
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="user@example.com"
                            value={form.email} onChange={handleChange('email')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Пароль</label>
                        <input className="form-input" type="password" placeholder="••••••••"
                            value={form.password} onChange={handleChange('password')} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Вход...' : 'Войти →'}
                    </button>
                </form>
                <div className="auth-link">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </div>
            </div>
        </div>
    );
}
