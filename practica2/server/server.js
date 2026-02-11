const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Статические файлы (чтобы можно было открыть через localhost:3000)
app.use(express.static(path.join(__dirname, '..')));

// Тестовая база данных товаров
let products = [
  { id: 1, name: 'Плюшевая игрушка Jane Doe', price: 5990 },
  { id: 2, name: 'Зипхуди Dota2', price: 2490 }
];

let currentId = 3;

// GET - фукнция чтобы получить все товары
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

// GET - функция для получения товара по ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }
  
  res.json({ success: true, data: product });
});

// POST - фукнция для создания нового товара
app.post('/api/products', (req, res) => {
  const { name, price } = req.body;
  
  if (!name || !price) {
    return res.status(400).json({ 
      success: false, 
      message: 'Название и цена обязательны' 
    });
  }
  
  const newProduct = {
    id: currentId++,
    name,
    price: parseFloat(price)
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Товар создан',
    data: newProduct
  });
});

// PUT - фунция для обновления товара
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }
  
  if (!name || !price) {
    return res.status(400).json({ 
      success: false, 
      message: 'Название и цена обязательны' 
    });
  }
  
  products[productIndex] = {
    id,
    name,
    price: parseFloat(price)
  };
  
  res.json({
    success: true,
    message: 'Товар обновлен',
    data: products[productIndex]
  });
});

// DELETE - функция для удаления товара
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    success: true,
    message: 'Товар удален',
    data: deletedProduct
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`Открыть для проверки http://localhost:${PORT}/index.html`);
});
