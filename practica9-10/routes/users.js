const express = require('express');
const { loadDB, saveDB } = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Все маршруты пользователей доступны только администраторам
router.use(authMiddleware, roleMiddleware(['admin']));

// GET /api/users — Получить список пользователей
router.get('/', (req, res) => {
    try {
        const db = loadDB();
        const users = db.users.map(u => ({
            id: u.id,
            email: u.email,
            first_name: u.first_name,
            last_name: u.last_name,
            role: u.role || 'user',
            blocked: u.blocked || false
        }));
        res.json(users);
    } catch (error) {
        console.error('Ошибка получения пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/users/:id — Получить пользователя по id
router.get('/:id', (req, res) => {
    try {
        const db = loadDB();
        const user = db.users.find(u => u.id === Number(req.params.id));

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role || 'user',
            blocked: user.blocked || false
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// PUT /api/users/:id — Обновить информацию пользователя
router.put('/:id', (req, res) => {
    try {
        const { first_name, last_name, role, blocked } = req.body;
        const db = loadDB();
        const index = db.users.findIndex(u => u.id === Number(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const existing = db.users[index];
        db.users[index] = {
            ...existing,
            first_name: first_name || existing.first_name,
            last_name: last_name || existing.last_name,
            role: role || existing.role || 'user',
            blocked: blocked !== undefined ? blocked : existing.blocked
        };
        saveDB(db);

        const updated = db.users[index];
        res.json({
            message: 'Пользователь обновлён',
            user: {
                id: updated.id,
                email: updated.email,
                first_name: updated.first_name,
                last_name: updated.last_name,
                role: updated.role,
                blocked: updated.blocked || false
            }
        });
    } catch (error) {
        console.error('Ошибка обновления пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// DELETE /api/users/:id — Заблокировать пользователя
router.delete('/:id', (req, res) => {
    try {
        const db = loadDB();
        const index = db.users.findIndex(u => u.id === Number(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        db.users[index].blocked = true;
        saveDB(db);

        res.json({ message: 'Пользователь заблокирован' });
    } catch (error) {
        console.error('Ошибка блокировки пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
