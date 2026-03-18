import React, { useState, useEffect } from 'react';
import ProductList from '../components/ProductList';
import './HomePage.css';

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка сервера');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <main className="home-page">
      <h1 className="home-page__title">ZVC — Магазин игровых товаров</h1>
      {loading && <p className="home-page__status">Загрузка товаров...</p>}
      {error && <p className="home-page__status home-page__status--error">{error}</p>}
      {!loading && !error && <ProductList products={products} />}
    </main>
  );
}

export default HomePage;
