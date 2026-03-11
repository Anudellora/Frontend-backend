import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function RegisterPage({ addToast }) {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 4) {
            addToast('Пароль должен быть не менее 4 символов', 'error');
            return;
        }
        setLoading(true);
        try {
            await register(form.email, form.first_name, form.last_name, form.password);
            addToast('Регистрация прошла успешно! Войдите в систему.', 'success');
            navigate('/login');
        } catch (err) {
            addToast(err.response?.data?.message || 'Ошибка регистрации', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Регистрация</h1>
                <p className="subtitle">Создайте аккаунт для начала работы</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Имя</label>
                            <input className="form-input" placeholder="Иван"
                                value={form.first_name} onChange={handleChange('first_name')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Фамилия</label>
                            <input className="form-input" placeholder="Петров"
                                value={form.last_name} onChange={handleChange('last_name')} required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="user@example.com"
                            value={form.email} onChange={handleChange('email')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Пароль (мин. 4 символа)</label>
                        <input className="form-input" type="password" placeholder="••••••••"
                            value={form.password} onChange={handleChange('password')} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Создание...' : 'Зарегистрироваться →'}
                    </button>
                </form>
                <div className="auth-link">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </div>
            </div>
        </div>
    );
}
