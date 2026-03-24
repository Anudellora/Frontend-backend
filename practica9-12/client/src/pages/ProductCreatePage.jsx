import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductForm from '../components/ProductForm';

export default function ProductCreatePage({ addToast }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            const { data } = await api.post('/products', formData);
            addToast(`Товар «${data.product.title}» создан! ✅`, 'success');
            navigate('/');
        } catch (err) {
            addToast(err.response?.data?.message || 'Ошибка при создании', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="page-header">
                    <h1>Новый товар</h1>
                    <p>Заполните данные о товаре</p>
                </div>
                <div style={{ maxWidth: 640 }}>
                    <div className="card">
                        <ProductForm onSubmit={handleSubmit} submitLabel="Создать товар" loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
}
