import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProductPage.css';

const CATEGORIES = ['Одежда', 'Игрушки', 'Аксессуары', 'Коллекционное', 'Книги', 'Другое'];

const INITIAL_FORM = {
  name: '',
  category: '',
  description: '',
  price: '',
  stock: '',
  image: '',
  rating: '',
};

function AddProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка при добавлении товара');
      }
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="add-page">
      <div className="add-form-wrap">
        <h1 className="add-form__title">Добавить товар</h1>

        {success && (
          <p className="add-form__message add-form__message--success">
            Товар добавлен! Перенаправление на главную...
          </p>
        )}
        {error && (
          <p className="add-form__message add-form__message--error">
            {error}
          </p>
        )}

        <form className="add-form" onSubmit={handleSubmit}>
          <label className="add-form__label">
            Название *
            <input
              className="add-form__input"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Название товара"
            />
          </label>

          <label className="add-form__label">
            Категория *
            <select
              className="add-form__input"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Выберите категорию</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="add-form__label">
            Описание *
            <textarea
              className="add-form__input add-form__textarea"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Описание товара"
              rows={4}
            />
          </label>

          <div className="add-form__row">
            <label className="add-form__label">
              Цена (₽) *
              <input
                className="add-form__input"
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="1990"
              />
            </label>

            <label className="add-form__label">
              Остаток на складе *
              <input
                className="add-form__input"
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
                placeholder="10"
              />
            </label>
          </div>

          <label className="add-form__label">
            URL изображения
            <input
              className="add-form__input"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </label>

          <label className="add-form__label">
            Рейтинг (0–5)
            <input
              className="add-form__input"
              type="number"
              name="rating"
              value={form.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              placeholder="4.5"
            />
          </label>

          <button className="add-form__btn" type="submit">
            Добавить товар
          </button>
        </form>
      </div>
    </main>
  );
}

export default AddProductPage;
