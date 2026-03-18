const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
// Используем порт 5001, чтобы избежать конфликта с AirPlay на macOS
const PORT = 5001;

app.use(cors());
app.use(express.json());

// ─── Swagger Configuration ───────────────────────────────────────────────────

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'ZVC Store API',
    version: '1.0.0',
    description: 'API документация для интернет-магазина ZVC',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Локальный сервер',
    },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./index.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Swagger Schema ──────────────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор продукта
 *           example: 1
 *         name:
 *           type: string
 *           description: Название продукта
 *           example: Плюшевая игрушка Jane Doe
 *         category:
 *           type: string
 *           description: Категория продукта
 *           example: Игрушки
 *         description:
 *           type: string
 *           description: Описание продукта
 *           example: Плюшевая игрушка Jane Doe из игры Zenless Zone Zero.
 *         price:
 *           type: number
 *           description: Цена продукта
 *           example: 1990
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 25
 *         image:
 *           type: string
 *           description: Путь к изображению
 *           example: ./img/janedoeplush.png
 *         rating:
 *           type: number
 *           description: Рейтинг продукта
 *           example: 4.8
 */

// ─── Data ────────────────────────────────────────────────────────────────────

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

let nextId = 11;

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все продукты
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Массив всех продуктов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Добавить новый продукт
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Продукт успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Не заполнены обязательные поля
 */
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

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Данные продукта
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
app.get('/api/products/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Продукт не найден' });
  }
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Продукт успешно обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Продукт не найден
 */
app.patch('/api/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Продукт не найден' });
  }

  const { name, category, description, price, stock, image, rating } = req.body;

  if (name !== undefined) products[index].name = name;
  if (category !== undefined) products[index].category = category;
  if (description !== undefined) products[index].description = description;
  if (price !== undefined) products[index].price = Number(price);
  if (stock !== undefined) products[index].stock = Number(stock);
  if (image !== undefined) products[index].image = image;
  if (rating !== undefined) products[index].rating = Number(rating);

  res.json(products[index]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить продукт по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID продукта
 *     responses:
 *       200:
 *         description: Продукт успешно удалён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Продукт удалён
 *       404:
 *         description: Продукт не найден
 */
app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex((p) => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Продукт не найден' });
  }

  products.splice(index, 1);
  res.json({ message: 'Продукт удалён' });
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`ZVC Server запущен: http://localhost:${PORT}`);
  console.log(`Swagger документация: http://localhost:${PORT}/api-docs`);
});