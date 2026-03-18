const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors({
    origin: ['http://localhost:4001', 'http://localhost:4000'],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Serve React build in production
const clientDist = path.join(__dirname, 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(clientDist, 'index.html'));
        }
    });
} else {
    // Fallback to legacy public/ folder
    app.use(express.static(path.join(__dirname, 'public')));
}

// Root API info
app.get('/api', (req, res) => {
    res.json({
        message: 'Practica 9-10 — REST API Server',
        routes: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                refresh: 'POST /api/auth/refresh',
                me: 'GET /api/auth/me'
            },
            users: {
                getAll: 'GET /api/users (admin)',
                getById: 'GET /api/users/:id (admin)',
                update: 'PUT /api/users/:id (admin)',
                block: 'DELETE /api/users/:id (admin)'
            },
            products: {
                create: 'POST /api/products (seller, admin)',
                getAll: 'GET /api/products (user, seller, admin)',
                getById: 'GET /api/products/:id (user, seller, admin)',
                update: 'PUT /api/products/:id (seller, admin)',
                delete: 'DELETE /api/products/:id (admin)'
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`React dev: http://localhost:4001 (proxy → :${PORT})`);
});
