import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCard({ product, onDelete, toast }) {
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!window.confirm(`Удалить товар «${product.title}»?`)) return;
        setDeleting(true);
        try {
            await onDelete(product.id);
            toast('Товар удалён');
        } catch (err) {
            toast(err.response?.data?.message || 'Ошибка при удалении', 'error');
            setDeleting(false);
        }
    };

    return (
        <div className="product-card">
            <div>
                <span className="product-category">{product.category}</span>
            </div>
            <div className="product-title">{product.title}</div>
            {product.description && (
                <div className="product-desc">{product.description}</div>
            )}
            <div className="product-price">{Number(product.price).toLocaleString('ru-RU')} ₽</div>
            <div className="product-actions">
                <Link to={`/products/${product.id}`} className="btn btn-secondary btn-sm">
                    👁 Просмотр
                </Link>
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                >
                    ✏️ Изменить
                </button>
                <button
                    className="btn btn-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                >
                    🗑 Удалить
                </button>
            </div>
            <div className="product-id">ID: {product.id}</div>
        </div>
    );
}
