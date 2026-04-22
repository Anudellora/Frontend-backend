const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const ALLOWED_FIELDS = ['first_name', 'last_name', 'age'];

function validateCreatePayload(body) {
  const errors = [];
  const { first_name, last_name, age } = body || {};

  if (typeof first_name !== 'string' || !first_name.trim()) {
    errors.push('Поле "first_name" обязательно и должно быть строкой');
  }
  if (typeof last_name !== 'string' || !last_name.trim()) {
    errors.push('Поле "last_name" обязательно и должно быть строкой');
  }
  if (!Number.isInteger(age) || age < 0 || age > 150) {
    errors.push('Поле "age" должно быть целым числом от 0 до 150');
  }
  return errors;
}

// POST /api/users — создание
router.post('/', async (req, res) => {
  const errors = validateCreatePayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const { first_name, last_name, age } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (first_name, last_name, age)
       VALUES ($1, $2, $3)
       RETURNING id, first_name, last_name, age, created_at, updated_at`,
      [first_name.trim(), last_name.trim(), age]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/users:', err);
    res.status(500).json({ error: 'Не удалось создать пользователя' });
  }
});

// GET /api/users — список
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, age, created_at, updated_at
       FROM users
       ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/users:', err);
    res.status(500).json({ error: 'Не удалось получить список пользователей' });
  }
});

// GET /api/users/:id — один пользователь
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Некорректный id' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, first_name, last_name, age, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/users/:id:', err);
    res.status(500).json({ error: 'Не удалось получить пользователя' });
  }
});

// PATCH /api/users/:id — обновление
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Некорректный id' });
  }

  const updates = {};
  for (const key of ALLOWED_FIELDS) {
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
      updates[key] = req.body[key];
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'Нет полей для обновления' });
  }

  if (updates.first_name !== undefined &&
      (typeof updates.first_name !== 'string' || !updates.first_name.trim())) {
    return res.status(400).json({ error: '"first_name" должно быть непустой строкой' });
  }
  if (updates.last_name !== undefined &&
      (typeof updates.last_name !== 'string' || !updates.last_name.trim())) {
    return res.status(400).json({ error: '"last_name" должно быть непустой строкой' });
  }
  if (updates.age !== undefined &&
      (!Number.isInteger(updates.age) || updates.age < 0 || updates.age > 150)) {
    return res.status(400).json({ error: '"age" должно быть целым числом от 0 до 150' });
  }

  const setFragments = [];
  const values = [];
  let i = 1;
  for (const [key, value] of Object.entries(updates)) {
    setFragments.push(`${key} = $${i++}`);
    values.push(typeof value === 'string' ? value.trim() : value);
  }
  setFragments.push(`updated_at = EXTRACT(EPOCH FROM NOW())::BIGINT`);
  values.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE users SET ${setFragments.join(', ')}
       WHERE id = $${i}
       RETURNING id, first_name, last_name, age, created_at, updated_at`,
      values
    );
    if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/users/:id:', err);
    res.status(500).json({ error: 'Не удалось обновить пользователя' });
  }
});

// DELETE /api/users/:id — удаление
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Некорректный id' });
  }
  try {
    const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    if (!rowCount) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён', id });
  } catch (err) {
    console.error('DELETE /api/users/:id:', err);
    res.status(500).json({ error: 'Не удалось удалить пользователя' });
  }
});

module.exports = router;
