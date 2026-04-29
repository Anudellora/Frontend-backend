const express = require('express');
const { loadDB, saveDB } = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { cacheMiddleware, saveToCache, invalidateCache } = require('../middleware/cacheMiddleware');

const router = express.Router();

const USERS_CACHE_TTL = 60; // 1 минута

router.use(authMiddleware, roleMiddleware(['admin']));

// GET /api/users — список пользователей (кэш 1 минута)
router.get(
    '/',
    cacheMiddleware(() => 'users:all', USERS_CACHE_TTL),
    async (req, res) => {
        try {
            const db = loadDB();
            const data = db.users.map(u => ({
                id: u.id,
                email: u.email,
                first_name: u.first_name,
                last_name: u.last_name,
                role: u.role || 'user',
                blocked: u.blocked || false
            }));

            await saveToCache(req.cacheKey, data, req.cacheTTL);

            res.json({ source: 'server', data });
        } catch (error) {
            console.error('Ошибка получения пользователей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// GET /api/users/:id — пользователь по id (кэш 1 минута)
router.get(
    '/:id',
    cacheMiddleware((req) => `users:${req.params.id}`, USERS_CACHE_TTL),
    async (req, res) => {
        try {
            const db = loadDB();
            const user = db.users.find(u => u.id === Number(req.params.id));

            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            const data = {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role || 'user',
                blocked: user.blocked || false
            };

            await saveToCache(req.cacheKey, data, req.cacheTTL);

            res.json({ source: 'server', data });
        } catch (error) {
            console.error('Ошибка получения пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// PUT /api/users/:id — обновить пользователя (инвалидация кэша)
router.put('/:id', async (req, res) => {
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

        await invalidateCache('users:all', `users:${req.params.id}`);

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

// DELETE /api/users/:id — заблокировать пользователя (инвалидация кэша)
router.delete('/:id', async (req, res) => {
    try {
        const db = loadDB();
        const index = db.users.findIndex(u => u.id === Number(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        db.users[index].blocked = true;
        saveDB(db);

        await invalidateCache('users:all', `users:${req.params.id}`);

        res.json({ message: 'Пользователь заблокирован' });
    } catch (error) {
        console.error('Ошибка блокировки пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
