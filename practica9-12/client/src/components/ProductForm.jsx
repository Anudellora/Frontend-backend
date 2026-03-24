import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Электроника', 'Одежда', 'Техника', 'Книги', 'Спорт', 'Дом и сад', 'Другое'];

export default function ProductForm({ initial = {}, onSubmit, submitLabel = 'Сохранить', loading }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: initial.title || '',
        category: initial.category || CATEGORIES[0],
        description: initial.description || '',
        price: initial.price ?? '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initial.title) {
            setForm({
                title: initial.title,
                category: initial.category || CATEGORIES[0],
                description: initial.description || '',
                price: initial.price ?? '',
            });
        }
    }, [initial.title]);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Название обязательно';
        if (!form.category) e.category = 'Категория обязательна';
        if (form.price === '' || Number(form.price) < 0) e.price = 'Введите корректную цену';
        return e;
    };

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setErrors((er) => ({ ...er, [field]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        await onSubmit({ ...form, price: Number(form.price) });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label className="form-label">Название</label>
                <input className="form-input" placeholder="Название товара" value={form.title} onChange={handleChange('title')} />
                {errors.title && <div className="form-error">{errors.title}</div>}
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Категория</label>
                    <select className="form-select" value={form.category} onChange={handleChange('category')}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <div className="form-error">{errors.category}</div>}
                </div>
                <div className="form-group">
                    <label className="form-label">Цена (₽)</label>
                    <input className="form-input" type="number" min="0" placeholder="0" value={form.price} onChange={handleChange('price')} />
                    {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea className="form-textarea" placeholder="Краткое описание товара..." value={form.description} onChange={handleChange('description')} />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Сохранение...' : submitLabel}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                    Отмена
                </button>
            </div>
        </form>
    );
}
