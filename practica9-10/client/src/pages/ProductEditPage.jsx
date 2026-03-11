import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';

export default function ProductEditPage({ addToast }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(({ data }) => setProduct(data))
            .catch(() => {
                addToast('Товар не найден', 'error');
                navigate('/');
            })
            .finally(() => setFetching(false));
    }, [id]);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            const { data } = await api.put(`/products/${id}`, formData);
            addToast(`Товар «${data.product.title}» обновлён! ✅`, 'success');
            navigate(`/products/${id}`);
        } catch (err) {
            addToast(err.response?.data?.message || 'Ошибка при обновлении', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="spinner-wrap"><div className="spinner" /></div>;

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>Редактирование товара</h1>
                    <p>ID: #{id}</p>
                </div>
                <div style={{ maxWidth: 640 }}>
                    <div className="card">
                        {product && (
                            <ProductForm
                                initial={product}
                                onSubmit={handleSubmit}
                                submitLabel="Сохранить изменения"
                                loading={loading}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
