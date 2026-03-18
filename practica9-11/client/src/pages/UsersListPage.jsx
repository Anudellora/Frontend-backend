import { useEffect, useState } from 'react';
import api from '../api/axios';

const ROLE_LABELS = {
    user: '👤 Пользователь',
    seller: '🏪 Продавец',
    admin: '👑 Администратор',
};

export default function UsersListPage({ addToast }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingParams, setUpdatingParams] = useState(null); // id: { role?: string, blocked?: boolean }
    const [search, setSearch] = useState('');

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            addToast('Ошибка загрузки списка пользователей', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const updateUser = async (id, paramKey, paramVal) => {
        try {
            await api.put(`/users/${id}`, { [paramKey]: paramVal });
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, [paramKey]: paramVal } : u));
            addToast(`Пользователь #${id} обновлён`, 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Ошибка при обновлении пользователя', 'error');
        }
    };

    const handleRoleChange = (id, newRole) => {
        updateUser(id, 'role', newRole);
    };

    const toggleBlock = (id, currentBlockedStatus) => {
        updateUser(id, 'blocked', !currentBlockedStatus);
    };

    const filtered = users.filter((u) => 
        u.email.toLowerCase().includes(search.toLowerCase()) || 
        u.first_name.toLowerCase().includes(search.toLowerCase()) || 
        u.last_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>👥 Пользователи</h1>
                    <p>Панель администратора: управление правами и блокировкой</p>
                </div>

                <div className="filter-row">
                    <input
                        className="form-input"
                        placeholder="Поиск по Email или ФИО..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="spinner-wrap"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>Ничего не найдено</h3>
                    </div>
                ) : (
                    <div style={{
                        background: 'var(--bg2)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        marginTop: '1.5rem'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>ID</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Пользователь</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Роль</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>Статус</th>
                                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600, textAlign: 'right' }}>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>#{u.id}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{u.first_name} {u.last_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <select 
                                                className="form-input" 
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                            >
                                                <option value="user">Пользователь</option>
                                                <option value="seller">Продавец</option>
                                                <option value="admin">Администратор</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            {u.blocked ? (
                                                <span style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.15rem 0.4rem', borderRadius: 4, fontSize: '0.75rem' }}>Заблокирован</span>
                                            ) : (
                                                <span style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '0.15rem 0.4rem', borderRadius: 4, fontSize: '0.75rem' }}>Активен</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                                            <button 
                                                className={`btn btn-sm ${u.blocked ? 'btn-secondary' : 'btn-danger'}`}
                                                onClick={() => toggleBlock(u.id, u.blocked)}
                                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                            >
                                                {u.blocked ? '🔓 Разблокировать' : '🚫 Блокировать'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
