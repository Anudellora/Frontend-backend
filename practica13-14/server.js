/**
 * HTTPS-сервер для PWA приложения
 * Практика 13-14 (доработка: Socket.IO + Push Notifications + Напоминания)
 *
 * Использует самоподписанный TLS-сертификат для локальной разработки.
 * Service Worker требует HTTPS для корректной работы.
 *
 * Запуск: node server.js
 * Доступ: https://localhost:3443
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');
const webPush = require('web-push');

// ==========================================
// КОНФИГУРАЦИЯ
// ==========================================
const PORT = 3443;

// VAPID-ключи (сгенерированы через: npx web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = 'BEcawiIMwvXEcU8HirSxuwDgv_J3uHCaH4J8sC9rBktlvE0YKt4Jj5KMKal9zT0GbON9wP1AwLpRKA-BDJkzmGU';
const VAPID_PRIVATE_KEY = '2Sr1rXbj_LeMnIFwbQ_KrL5SdUDx-7kBIyjL7IQ1w3A';

webPush.setVapidDetails(
    'mailto:student@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

// Хранилище подписок (в реальном проекте — база данных)
let pushSubscriptions = [];

// Хранилище активных таймеров напоминаний: { noteId: timeoutId }
const reminderTimers = new Map();

// ==========================================
// СЕРТИФИКАТЫ
// ==========================================
const certDir = path.join(__dirname, 'certs');
let sslOptions;

try {
    sslOptions = {
        key: fs.readFileSync(path.join(certDir, 'key.pem')),
        cert: fs.readFileSync(path.join(certDir, 'cert.pem'))
    };
} catch (e) {
    console.error('❌ Сертификаты не найдены!');
    console.error('Выполните для генерации:');
    console.error('  mkdir -p certs && openssl req -x509 -newkey rsa:2048 -keyout certs/key.pem -out certs/cert.pem -days 365 -nodes -subj "/CN=localhost"');
    process.exit(1);
}

// ==========================================
// EXPRESS-ПРИЛОЖЕНИЕ
// ==========================================
const app = express();
app.use(express.json());

// Раздача статических файлов
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        res.setHeader('Service-Worker-Allowed', '/');
        // Полностью отключаем кэширование браузером во время разработки
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }
}));

// Эндпоинт — получение публичного VAPID-ключа
app.get('/vapidPublicKey', (req, res) => {
    res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Эндпоинт — подписка на push-уведомления
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: 'Некорректная подписка' });
    }

    // Проверяем, нет ли уже такой подписки
    const exists = pushSubscriptions.some(s => s.endpoint === subscription.endpoint);
    if (!exists) {
        pushSubscriptions.push(subscription);
        console.log(`📬 Новая push-подписка. Всего подписок: ${pushSubscriptions.length}`);
    }

    res.status(201).json({ message: 'Подписка сохранена' });
});

// Эндпоинт — отписка от push-уведомлений
app.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    if (!endpoint) {
        return res.status(400).json({ error: 'Не указан endpoint' });
    }

    const before = pushSubscriptions.length;
    pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== endpoint);
    console.log(`🔕 Подписка удалена. Было: ${before}, осталось: ${pushSubscriptions.length}`);

    res.json({ message: 'Подписка удалена' });
});

// ==========================================
// НАПОМИНАНИЯ — ПЛАНИРОВАНИЕ И УПРАВЛЕНИЕ
// ==========================================

/**
 * Отправить push-уведомление о напоминании всем подписчикам
 */
const sendReminderPush = (noteId, noteTitle) => {
    console.log(`⏰ Напоминание сработало для заметки "${noteTitle}" (id: ${noteId})`);

    const payload = JSON.stringify({
        title: '⏰ Напоминание!',
        body: noteTitle,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `reminder-${noteId}`,
        data: {
            url: '/',
            noteId: noteId,
            type: 'reminder'
        }
    });

    pushSubscriptions.forEach((sub, index) => {
        webPush.sendNotification(sub, payload)
            .then(() => {
                console.log(`📨 Напоминание отправлено подписчику #${index + 1}`);
            })
            .catch((err) => {
                console.error(`❌ Ошибка отправки напоминания #${index + 1}:`, err.statusCode);
                if (err.statusCode === 404 || err.statusCode === 410) {
                    pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                    console.log('🗑️  Невалидная подписка удалена');
                }
            });
    });

    // Удаляем таймер из хранилища — он уже сработал
    reminderTimers.delete(noteId);
};

/**
 * Планирование напоминания через setTimeout
 */
const scheduleReminder = (noteId, noteTitle, reminderTimestamp) => {
    // Отменяем предыдущий таймер для этой заметки, если он был
    if (reminderTimers.has(noteId)) {
        clearTimeout(reminderTimers.get(noteId));
        reminderTimers.delete(noteId);
        console.log(`🔄 Старый таймер для "${noteTitle}" отменён`);
    }

    const now = Date.now();
    const delay = reminderTimestamp - now;

    if (delay <= 0) {
        // Время уже прошло — отправляем немедленно
        console.log(`⚡ Напоминание для "${noteTitle}" — время уже наступило, отправляем сразу`);
        sendReminderPush(noteId, noteTitle);
        return;
    }

    const timerId = setTimeout(() => {
        sendReminderPush(noteId, noteTitle);
    }, delay);

    reminderTimers.set(noteId, timerId);

    const reminderDate = new Date(reminderTimestamp).toLocaleString('ru-RU');
    console.log(`⏰ Напоминание запланировано: "${noteTitle}" → ${reminderDate} (через ${Math.round(delay / 1000)} сек.)`);
};

// Эндпоинт — установка / планирование напоминания
app.post('/schedule-reminder', (req, res) => {
    const { noteId, title, reminder } = req.body;

    if (!noteId || !title || !reminder) {
        return res.status(400).json({ error: 'Не все поля заполнены (noteId, title, reminder)' });
    }

    scheduleReminder(noteId, title, reminder);
    res.json({ message: 'Напоминание запланировано', noteId, reminder });
});

// Эндпоинт — отмена напоминания
app.post('/cancel-reminder', (req, res) => {
    const { noteId } = req.body;

    if (!noteId) {
        return res.status(400).json({ error: 'Не указан noteId' });
    }

    if (reminderTimers.has(noteId)) {
        clearTimeout(reminderTimers.get(noteId));
        reminderTimers.delete(noteId);
        console.log(`🗑️  Напоминание отменено для заметки ${noteId}`);
    }

    res.json({ message: 'Напоминание отменено', noteId });
});

// Эндпоинт — отложить напоминание (snooze)
app.post('/snooze-reminder', (req, res) => {
    const { noteId, title, minutes } = req.body;

    if (!noteId || !title) {
        return res.status(400).json({ error: 'Не все поля заполнены' });
    }

    const snoozeMinutes = minutes || 5;
    const newReminder = Date.now() + snoozeMinutes * 60 * 1000;

    scheduleReminder(noteId, title, newReminder);

    const newDate = new Date(newReminder).toLocaleString('ru-RU');
    console.log(`😴 Напоминание "${title}" отложено на ${snoozeMinutes} мин. → ${newDate}`);

    res.json({ message: `Напоминание отложено на ${snoozeMinutes} мин.`, noteId, newReminder });
});

// Эндпоинт — получить статус активных таймеров (для отладки)
app.get('/reminders-status', (req, res) => {
    const active = [];
    reminderTimers.forEach((timerId, noteId) => {
        active.push({ noteId, active: true });
    });
    res.json({ activeReminders: active, total: active.length });
});

// ==========================================
// HTTP / HTTPS + SOCKET.IO
// ==========================================
const httpsServer = https.createServer(sslOptions, app);
const httpServer = http.createServer(app);

const io = new Server({
    cors: { origin: '*' }
});
io.attach(httpsServer);
io.attach(httpServer);

// ==========================================
// SOCKET.IO — ОБРАБОТКА СОБЫТИЙ
// ==========================================
io.on('connection', (socket) => {
    console.log(`🔌 Клиент подключён: ${socket.id}`);

    // Получаем событие «newTask» от клиента
    socket.on('newTask', (task) => {
        console.log(`📝 Новая задача от ${socket.id}:`, task.title);

        // Рассылаем событие «taskAdded» ВСЕМ подключённым клиентам
        io.emit('taskAdded', {
            id: task.id,
            title: task.title,
            text: task.text,
            reminder: task.reminder || null,
            createdAt: task.createdAt,
            fromSocket: socket.id
        });

        // Если есть напоминание — планируем его на сервере
        if (task.reminder) {
            scheduleReminder(task.id, task.title, task.reminder);
        }

        // Отправляем push-уведомления всем подписчикам
        const payload = JSON.stringify({
            title: 'Новая заметка!',
            body: task.title,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url: '/', type: 'newTask' }
        });

        pushSubscriptions.forEach((sub, index) => {
            webPush.sendNotification(sub, payload)
                .then(() => {
                    console.log(`📨 Push отправлен подписчику #${index + 1}`);
                })
                .catch((err) => {
                    console.error(`❌ Ошибка push #${index + 1}:`, err.statusCode);
                    if (err.statusCode === 404 || err.statusCode === 410) {
                        pushSubscriptions = pushSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                        console.log('🗑️  Невалидная подписка удалена');
                    }
                });
        });
    });

    socket.on('disconnect', () => {
        console.log(`❌ Клиент отключён: ${socket.id}`);
    });
});

// ==========================================
// ЗАПУСК СЕРВЕРА
// ==========================================
httpsServer.listen(PORT, () => {
    console.log('');
    console.log('🔒 HTTPS-сервер запущен!');
    console.log(`   https://localhost:${PORT}`);
    console.log('');
    console.log('🔌 Socket.IO активен');
    console.log('📬 Push-уведомления настроены');
    console.log('⏰ Система напоминаний активна');
    console.log('');
    console.log('⚠️  Браузер покажет предупреждение о самоподписанном сертификате.');
    console.log('   Нажмите "Дополнительно" → "Перейти на сайт" для продолжения.');
    console.log('   (Внимание: Chrome блокирует Push API при использовании недоверенного сертификата!)');
});

httpServer.listen(3000, () => {
    console.log('');
    console.log('🔓 HTTP-сервер также запущен!');
    console.log('   👉 http://localhost:3000');
    console.log('   Откройте эту ссылку в Chrome, чтобы Push-уведомления работали без ошибок сертификата.');
    console.log('');
});
