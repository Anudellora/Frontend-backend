const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { loadDB, saveDB } = require('../config/database');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/register — Регистрация пользователя
router.post('/register', (req, res) => {
    try {
        const { email, first_name, last_name, password } = req.body;

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
        const salt = bcrypt.genSaltSync(10); // Явная генерация соли (cost factor = 10)
        const hashedPassword = bcrypt.hashSync(password, salt); // Хешируем пароль с полученной солью

        // Создание пользователя
        const newUser = {
            id: db.nextUserId++,
            email,
            first_name,
            last_name,
            password: hashedPassword
        };
        db.users.push(newUser);
        saveDB(db);

        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: newUser.id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name
            }
        });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// POST /api/auth/login — Вход в систему
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

        // Проверка пароля
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Генерация JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );

        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/auth/me — Получить текущего пользователя
router.get('/me', authMiddleware, (req, res) => {
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
            last_name: user.last_name
        });
    } catch (error) {
        console.error('Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
