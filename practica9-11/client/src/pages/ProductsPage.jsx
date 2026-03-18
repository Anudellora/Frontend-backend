import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductsPage({ addToast }) {
    const { user, refreshTokens } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const userRole = user?.role || 'user';

    const loadProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            addToast('Ошибка загрузки товаров', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const handleDelete = async (id) => {
        await api.delete(`/products/${id}`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const data = await refreshTokens();
            addToast('Токены успешно обновлены! 🔄', 'success');
        } catch (err) {
            addToast(err.message || 'Ошибка обновления токенов', 'error');
        } finally {
            setRefreshing(false);
        }
    };

    const filtered = products.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>Товары</h1>
                    <p>Управление каталогом товаров</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Ваша роль: <strong style={{ color: 'var(--accent)' }}>{userRole}</strong>
                    </div>
                </div>

                {/* Refresh tokens panel */}
                <div className="tokens-panel">
                    <div className="tokens-label">
                        <strong>POST /api/auth/refresh</strong> — обновить пару access + refresh токенов
                    </div>
                    <button className="btn btn-secondary btn-sm" onClick={handleRefresh} disabled={refreshing}>
                        {refreshing ? 'Обновление...' : '🔄 Обновить токены'}
                    </button>
                </div>

                {/* Filter + Add button */}
                <div className="products-header">
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Каталог</h2>
                        <div className="products-count">{filtered.length} товаров</div>
                    </div>
                    {/* Кнопку "Добавить" видят только продавец и администратор */}
                    {(userRole === 'seller' || userRole === 'admin') && (
                        <Link to="/products/new" className="btn btn-primary">
                            + Добавить товар
                        </Link>
                    )}
                </div>

                <div className="filter-row">
                    <input
                        className="form-input"
                        placeholder="Поиск по названию или категории..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="spinner-wrap"><div className="spinner" /></div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h3>{search ? 'Ничего не найдено' : 'Товаров пока нет'}</h3>
                        <p>{search ? 'Попробуйте другой запрос' : 'Добавьте первый товар'}</p>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filtered.map((p) => (
                            <ProductCard key={p.id} product={p} onDelete={handleDelete} toast={addToast} userRole={userRole} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
