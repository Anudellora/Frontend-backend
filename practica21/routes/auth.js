const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadDB, saveDB } = require('../config/database');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/auth');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Helper: generate token pair (теперь включает role)
function generateTokens(payload) {
    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
    return { accessToken, refreshToken };
}

// POST /api/auth/register — Регистрация пользователя (Доступ: Гость)
router.post('/register', (req, res) => {
    try {
        const { email, first_name, last_name, password, role } = req.body;

        // Валидация
        if (!email || !first_name || !last_name || !password) {
            return res.status(400).json({
                message: 'Все поля обязательны: email, first_name, last_name, password'
            });
        }

        const db = loadDB();

        // Проверка, существует ли пользователь
        const existingUser = db.users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Генерация соли и хеширование пароля
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Присвоение роли из запроса (значение по умолчанию 'user')
        let userRole = 'user';
        if (['user', 'seller', 'admin'].includes(role)) {
            userRole = role;
        }

        // Создание пользователя
        const newUser = {
            id: db.nextUserId++,
            email,
            first_name,
            last_name,
            password: hashedPassword,
            role: userRole,
            blocked: false
        };
        db.users.push(newUser);
        saveDB(db);

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// POST /api/auth/login — Вход в систему (Доступ: Гость)
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        // Валидация
        if (!email || !password) {
            return res.status(400).json({ message: 'Email и password обязательны' });
        }

        const db = loadDB();

        // Поиск пользователя
        const user = db.users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверка блокировки
        if (user.blocked) {
            return res.status(403).json({ message: 'Пользователь заблокирован' });
        }

        // Проверка пароля
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Генерация пары токенов (включая role)
        const userRole = user.role || 'user';
        const { accessToken, refreshToken } = generateTokens({ id: user.id, email: user.email, role: userRole });

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: userRole
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// POST /api/auth/refresh — Обновление пары токенов (Доступ: Гость)
router.post('/refresh', (req, res) => {
    try {
        const refreshToken = req.headers['x-refresh-token'];

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh-токен не предоставлен' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, jwtRefreshSecret);
        } catch (err) {
            return res.status(401).json({ message: 'Недействительный или истёкший refresh-токен' });
        }

        // Убедимся, что пользователь ещё существует в БД
        const db = loadDB();
        const user = db.users.find(u => u.id === decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Пользователь не найден' });
        }

        if (user.blocked) {
            return res.status(403).json({ message: 'Пользователь заблокирован' });
        }

        // Выпускаем новую пару токенов (с актуальной ролью из БД)
        const userRole = user.role || 'user';
        const tokens = generateTokens({ id: user.id, email: user.email, role: userRole });

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (error) {
        console.error('Ошибка обновления токена:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/auth/me — Получить текущего пользователя (Доступ: Пользователь и выше)
router.get('/me', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
    try {
        const db = loadDB();
        const user = db.users.find(u => u.id === req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role || 'user'
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
