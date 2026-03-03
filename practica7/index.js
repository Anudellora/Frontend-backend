const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Practica 7 — REST API Server',
        routes: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            products: {
                create: 'POST /api/products',
                getAll: 'GET /api/products',
                getById: 'GET /api/products/:id',
                update: 'PUT /api/products/:id',
                delete: 'DELETE /api/products/:id'
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
