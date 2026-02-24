import React from 'react';
import './ProductCard.css';

function Stars({ rating }) {
  return (
    <div className="product-card__rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`product-card__star${n <= Math.round(rating) ? ' product-card__star--filled' : ''}`}
        >
          ★
        </span>
      ))}
      <span className="product-card__rating-value">{rating}</span>
    </div>
  );
}

function ProductCard({ product }) {
  const { name, category, description, price, stock, image, rating } = product;

  return (
    <div className="product-card">
      {image && (
        <img className="product-card__image" src={image} alt={name} />
      )}
      <span className="product-card__category">{category}</span>
      <h2 className="product-card__title">{name}</h2>
      <p className="product-card__description">{description}</p>
      {rating > 0 && <Stars rating={rating} />}
      <div className="product-card__footer">
        <span className="product-card__price">
          {price.toLocaleString('ru-RU')} ₽
        </span>
        <span className={`product-card__stock${stock === 0 ? ' product-card__stock--out' : ''}`}>
          {stock > 0 ? `В наличии: ${stock} шт.` : 'Нет в наличии'}
        </span>
      </div>
    </div>
  );
}

export default ProductCard;
