const express = require('express');
const { loadDB, saveDB } = require('../config/database');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { cacheMiddleware, saveToCache, invalidateCache } = require('../middleware/cacheMiddleware');

const router = express.Router();

const PRODUCTS_CACHE_TTL = 600; // 10 минут

// POST /api/products — создать товар (продавец, администратор)
router.post('/', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
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

// GET /api/products — список товаров (кэш 10 минут)
router.get(
    '/',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    cacheMiddleware(() => 'products:all', PRODUCTS_CACHE_TTL),
    async (req, res) => {
        try {
            const db = loadDB();
            const data = db.products;

            await saveToCache(req.cacheKey, data, req.cacheTTL);

            res.json({ source: 'server', data });
        } catch (error) {
            console.error('Ошибка получения товаров:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// GET /api/products/:id — товар по id (кэш 10 минут)
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware(['user', 'seller', 'admin']),
    cacheMiddleware((req) => `products:${req.params.id}`, PRODUCTS_CACHE_TTL),
    async (req, res) => {
        try {
            const db = loadDB();
            const product = db.products.find(p => p.id === Number(req.params.id));

            if (!product) {
                return res.status(404).json({ message: 'Товар не найден' });
            }

            await saveToCache(req.cacheKey, product, req.cacheTTL);

            res.json({ source: 'server', data: product });
        } catch (error) {
            console.error('Ошибка получения товара:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
);

// PUT /api/products/:id — обновить товар (инвалидация кэша)
router.put('/:id', authMiddleware, roleMiddleware(['seller', 'admin']), async (req, res) => {
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

        await invalidateCache('products:all', `products:${req.params.id}`);

        res.json({
            message: 'Товар успешно обновлён',
            product: db.products[index]
        });
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

// DELETE /api/products/:id — удалить товар (инвалидация кэша)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    try {
        const db = loadDB();
        const index = db.products.findIndex(p => p.id === Number(req.params.id));

        if (index === -1) {
            return res.status(404).json({ message: 'Товар не найден' });
        }

        db.products.splice(index, 1);
        saveDB(db);

        await invalidateCache('products:all', `products:${req.params.id}`);

        res.json({ message: 'Товар успешно удалён' });
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
});

module.exports = router;
