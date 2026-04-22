require('dotenv').config();
const express = require('express');
const pool = require('./db/pool');
const usersRouter = require('./routes/users');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'practice19 users API',
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
    await pool.query('SELECT 1');
    console.log('PostgreSQL подключен.');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Не удалось подключиться к PostgreSQL:', err.message);
    process.exit(1);
  }
})();
