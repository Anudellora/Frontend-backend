import React from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

function ProductList({ products }) {
  if (products.length === 0) {
    return <p className="product-list__empty">Товары не найдены</p>;
  }
  return (
    <ul className="product-list">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export default ProductList;
