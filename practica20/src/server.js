require('dotenv').config();
const express = require('express');
const connect = require('./db/connect');
const usersRouter = require('./routes/users');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'practica20 users API (MongoDB)',
    endpoints: [
      'POST   /api/users',
      'GET    /api/users',
      'GET    /api/users/:id',
      'PATCH  /api/users/:id',
      'DELETE /api/users/:id',
    ],
  });
});

app.use('/api/users', usersRouter);

app.use((_req, res) => res.status(404).json({ error: 'Маршрут не найден' }));

(async () => {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Не удалось подключиться к MongoDB:', err.message);
    process.exit(1);
  }
})();
