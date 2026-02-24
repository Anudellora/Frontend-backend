const express = require('express');
const cors = require('cors');

const app = express();
// Используем порт 5001, чтобы избежать конфликта с AirPlay на macOS
const PORT = 5001;

app.use(cors());
app.use(express.json());

let products = [
  {
    id: 1,
    name: 'Плюшевая игрушка Jane Doe',
    category: 'Игрушки',
    description:
      'Плюшевая игрушка Jane Doe из игры Zenless Zone Zero.',
    price: 1990,
    stock: 25,
    image: './img/janedoeplush.png',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Зипхуди Дота 2 International',
    category: 'Одежда',
    description:
      'Зипхуди Дота 2 International Сингапур, совместно с Adidas.',
    price: 2490,
    stock: 10,
    image: './img/zipdota2.png',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Плюшевая Фрирен',
    category: 'Игрушки',
    description:
      'Большая плюшевая игрушка Фрирен 30 см',
    price: 2990,
    stock: 10,
    image: './img/frierenplush.png',
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Плюшевая Ферн',
    category: 'Игрушки',
    description:
      'Плюшевая игрушка Ферн 15 см',
    price: 1990,
    stock: 10,
    image: './img/fernplush.png',
    rating: 4.9,
  },
  {
    id: 5,
    name: 'Манга Токийский Гуль RE:',
    category: 'Книги',
    description:
      'Все тома второй части Токийского гуля под названием RE',
    price: 4990,
    stock: 10,
    image: './img/tgmanga.png',
    rating: 4.9,
  },
  {
    id: 6,
    name: 'Плюшевая Валира Сангвинар',
    category: 'Игрушки',
    description:
      'Большая плюшевая игрушка Фрирен 15 см',
    price: 1990,
    stock: 10,
    image: './img/valiraplush.png',
    rating: 4.9,
  },
  {
    id: 7,
    name: 'Фигурка Funko-pop Эмгыра Вар Эмрейса',
    category: 'Игрушки',
    description:
      'Funkopop фигурка Эмгыра Вар Эмрейса 15 см',
    price: 1990,
    stock: 10,
    image: './img/emgirvaremreis.png',
    rating: 4.9,
  },
  {
    id: 8,
    name: 'Лего набор Острова',
    category: 'Игрушки',
    description:
      'Большой лего набор ондого знаменитого острова',
    price: 22990,
    stock: 10,
    image: './img/Epstein.png',
    rating: 4.9,
  },
  {
    id: 9,
    name: 'Фигурка Сильваны Ветрокрылой',
    category: 'Игрушки',
    description:
      'Коллекционная фигурна Сильваны Ветрокрылой 20 см',
    price: 3990,
    stock: 10,
    image: './img/sylvana.png',
    rating: 4.9,
  },
  {
    id: 10,
    name: 'Момонга',
    category: 'Игрушки',
    description:
      'Плюшевый момонга размером 10 см',
    price: 590,
    stock: 10,
    image: './img/momonga.png',
    rating: 4.9,
  },
];

let nextId = 3;

// GET — все товары
app.get('/api/products', (req, res) => {
  res.json(products);
});

// POST — добавить товар
app.post('/api/products', (req, res) => {
  const { name, category, description, price, stock, image, rating } = req.body;

  if (!name || !category || !description || price === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Заполните все обязательные поля' });
  }

  const newProduct = {
    id: nextId++,
    name,
    category,
    description,
    price: Number(price),
    stock: Number(stock),
    image: image || '',
    rating: rating ? Number(rating) : 0,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.listen(PORT, () => {
  console.log(`ZVC Server запущен: http://localhost:${PORT}`);
});