const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Токен не предоставлен' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Неверный формат токена' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Недействительный токен' });
    }
}

module.exports = authMiddleware;
