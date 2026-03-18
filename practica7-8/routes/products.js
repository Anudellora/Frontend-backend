const express = require('express');
const { loadDB, saveDB } = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/products — Создать товар (требуется авторизация)
router.post('/', authMiddleware, (req, res) => {
    try {
        const { title, category, description, price } = req.body;

        if (!title || !category || price === undefined) {
            return res.status(400).json({
                message: 'Обязательные поля: title, category, price'
            });
        }

        const db = loadDB();
        const newProduct = {
            id: db.nextProductId++,
            title,
            category,
            description: description || '',
            price
        };
        db.products.push(newProduct);
        saveDB(db);

        res.status(201).json({
            message: 'Товар успешно создан',
            product: newProduct
        });
    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/products — Получить список товаров
router.get('/', (req, res) => {
    try {
        const db = loadDB();
        res.json(db.products);
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// GET /api/products/:id — Получить товар по id
router.get('/:id', authMiddleware, (req, res) => {
    try {
        const db = loadDB();
        const product = db.products.find(p => p.id === Number(req.params.id));

        if (!product) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        res.json(product);
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// PUT /api/products/:id — Обновить параметры товара (требуется авторизация)
router.put('/:id', authMiddleware, (req, res) => {
    try {
        const { title, category, description, price } = req.body;

        const db = loadDB();
        const index = db.products.findIndex(p => p.id === Number(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        const existing = db.products[index];
        db.products[index] = {
            ...existing,
            title: title || existing.title,
            category: category || existing.category,
            description: description !== undefined ? description : existing.description,
            price: price !== undefined ? price : existing.price
        };
        saveDB(db);

        res.json({
            message: 'Товар успешно обновлён',
            product: db.products[index]
        });
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// DELETE /api/products/:id — Удалить товар (требуется авторизация)
router.delete('/:id', authMiddleware, (req, res) => {
    try {
        const db = loadDB();
        const index = db.products.findIndex(p => p.id === Number(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        db.products.splice(index, 1);
        saveDB(db);

        res.json({ message: 'Товар успешно удалён' });
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
