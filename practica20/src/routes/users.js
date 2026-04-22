const express = require('express');
const User = require('../models/User');

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

function parseId(raw) {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// POST /api/users
router.post('/', async (req, res) => {
  const errors = validateCreatePayload(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const user = await User.create({
      first_name: req.body.first_name.trim(),
      last_name: req.body.last_name.trim(),
      age: req.body.age,
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('POST /api/users:', err);
    res.status(500).json({ error: 'Не удалось создать пользователя' });
  }
});

// GET /api/users
router.get('/', async (_req, res) => {
  try {
    const users = await User.find().sort({ id: 1 });
    res.json(users);
  } catch (err) {
    console.error('GET /api/users:', err);
    res.status(500).json({ error: 'Не удалось получить список пользователей' });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id == null) return res.status(400).json({ error: 'Некорректный id' });
  try {
    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error('GET /api/users/:id:', err);
    res.status(500).json({ error: 'Не удалось получить пользователя' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id == null) return res.status(400).json({ error: 'Некорректный id' });

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
  if (typeof updates.first_name === 'string') updates.first_name = updates.first_name.trim();
  if (typeof updates.last_name === 'string')  updates.last_name  = updates.last_name.trim();
  updates.updated_at = Math.floor(Date.now() / 1000);

  try {
    const user = await User.findOneAndUpdate({ id }, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    console.error('PATCH /api/users/:id:', err);
    res.status(500).json({ error: 'Не удалось обновить пользователя' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id == null) return res.status(400).json({ error: 'Некорректный id' });
  try {
    const user = await User.findOneAndDelete({ id });
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json({ message: 'Пользователь удалён', id });
  } catch (err) {
    console.error('DELETE /api/users/:id:', err);
    res.status(500).json({ error: 'Не удалось удалить пользователя' });
  }
});

module.exports = router;
