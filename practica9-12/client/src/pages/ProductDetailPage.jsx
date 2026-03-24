import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../store/AuthContext';

export default function ProductDetailPage({ addToast }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const userRole = user?.role || 'user';

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(({ data }) => setProduct(data))
            .catch(() => {
                addToast('Товар не найден', 'error');
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm(`Удалить товар «${product.title}»?`)) return;
        try {
            await api.delete(`/products/${id}`);
            addToast('Товар удалён');
            navigate('/');
        } catch (err) {
            addToast(err.response?.data?.message || 'Ошибка при удалении', 'error');
        }
    };

    if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
    if (!product) return null;

    return (
        <div className="page">
            <div className="container">
                <div className="page-header" style={{ paddingTop: '1.5rem' }}>
                    <Link to="/" className="back-link">← Назад к списку</Link>
                </div>
                <div className="detail-page">
                    <div className="card">
                        <div className="detail-header">
                            <div>
                                <span className="product-category" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>
                                    {product.category}
                                </span>
                                <h1 className="detail-title">{product.title}</h1>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                {/* Редактировать могут продавцы и админы */}
                                {(userRole === 'seller' || userRole === 'admin') && (
                                    <Link to={`/products/${id}/edit`} className="btn btn-ghost btn-sm">✏️ Изменить</Link>
                                )}
                                {/* Удалять может ТОЛЬКО администратор */}
                                {userRole === 'admin' && (
                                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑 Удалить</button>
                                )}
                            </div>
                        </div>

                        <div className="detail-body">
                            <div className="detail-field">
                                <label>Цена</label>
                                <div className="detail-price">{Number(product.price).toLocaleString('ru-RU')} ₽</div>
                            </div>
                            {product.description && (
                                <div className="detail-field">
                                    <label>Описание</label>
                                    <p>{product.description}</p>
                                </div>
                            )}
                            <div className="detail-field">
                                <label>ID товара</label>
                                <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{product.id}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
