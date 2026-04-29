const express = require('express');
const cors = require('cors');
const { initRedis } = require('./config/redis');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

app.get('/api', (req, res) => {
    res.json({
        message: 'Practica 21 — REST API с кэшированием Redis',
        routes: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh',
                me: 'GET /api/auth/me'
            },
            users: {
                getAll: 'GET /api/users (admin) — кэш 1 мин',
                getById: 'GET /api/users/:id (admin) — кэш 1 мин',
                update: 'PUT /api/users/:id (admin)',
                block: 'DELETE /api/users/:id (admin)'
            },
            products: {
                create: 'POST /api/products (seller, admin)',
                getAll: 'GET /api/products (user, seller, admin) — кэш 10 мин',
                getById: 'GET /api/products/:id (user, seller, admin) — кэш 10 мин',
                update: 'PUT /api/products/:id (seller, admin)',
                delete: 'DELETE /api/products/:id (admin)'
            }
        }
    });
});

initRedis().then(() => {
    app.listen(PORT, () => {
        console.log(`Сервер запущен на http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('Не удалось подключиться к Redis:', err);
    process.exit(1);
});
