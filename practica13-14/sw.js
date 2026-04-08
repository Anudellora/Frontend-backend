/**
 * Service Worker — App Shell Architecture
 * Практика 13-14 (доработка: Push Notifications + Напоминания)
 *
 * Стратегии кэширования:
 *   1. CACHE FIRST — для статических ресурсов App Shell (оболочка приложения)
 *   2. NETWORK FIRST — для динамических страниц (pages/*.html)
 *
 * + Обработка push-уведомлений
 * + Действия в уведомлениях: «Отложить на 5 минут», «Открыть», «Закрыть»
 */

const CACHE_VERSION = 'v10';
const STATIC_CACHE = `app-shell-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `app-shell-dynamic-${CACHE_VERSION}`;

/**
 * Статические ресурсы App Shell — кэшируются при установке (precache)
 */
const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './style.css?v=latest',
    './app.js?v=latest',
    './manifest.json',
    './icon-192.png',
    './icon-256.png',
    './icon-512.png',
    './screenshot-desktop.png',
    './screenshot-mobile.png'
];

/**
 * Динамические страницы — загружаются по стратегии Network First
 */
const DYNAMIC_PAGES = [
    './pages/notes.html',
    './pages/about.html'
];

// ==========================================
// ЭТАП УСТАНОВКИ: Предкэширование App Shell
// ==========================================
self.addEventListener('install', (event) => {
    console.log('[SW] Установка — кэширование App Shell...');
    self.skipWaiting();

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Кэшируем статические ресурсы App Shell');
                return cache.addAll(APP_SHELL_ASSETS);
            })
            .then(() => {
                return caches.open(DYNAMIC_CACHE).then((cache) => {
                    console.log('[SW] Предварительно кэшируем динамические страницы');
                    return cache.addAll(DYNAMIC_PAGES);
                });
            })
            .catch((error) => {
                console.error('[SW] Ошибка при кэшировании:', error);
            })
    );
});

// ==========================================
// ЭТАП АКТИВАЦИИ: Очистка старых кэшей
// ==========================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Активация — очистка старых кэшей...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map((name) => {
                        console.log('[SW] Удаляем старый кэш:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// ==========================================
// ЭТАП ПЕРЕХВАТА ЗАПРОСОВ
// ==========================================
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Игнорируем не-HTTP запросы
    if (!event.request.url.startsWith('http')) return;

    // Игнорируем Socket.IO запросы
    if (requestUrl.pathname.startsWith('/socket.io')) return;

    // Игнорируем API-запросы (subscribe, unsubscribe, vapidPublicKey, reminders)
    const apiPaths = [
        '/subscribe', '/unsubscribe', '/vapidPublicKey',
        '/schedule-reminder', '/cancel-reminder', '/snooze-reminder', '/reminders-status'
    ];
    if (apiPaths.includes(requestUrl.pathname)) return;

    // Определяем, является ли запрос динамической страницей
    const isDynamicPage = DYNAMIC_PAGES.some((page) => {
        const pageUrl = new URL(page, self.location.href).pathname;
        return requestUrl.pathname.endsWith(pageUrl) || requestUrl.pathname === pageUrl;
    });

    if (isDynamicPage) {
        event.respondWith(networkFirst(event.request));
    } else {
        event.respondWith(cacheFirst(event.request));
    }
});

// ==========================================
// PUSH-УВЕДОМЛЕНИЯ
// ==========================================
self.addEventListener('push', (event) => {
    console.log('[SW] Push-уведомление получено');

    let data = {
        title: 'Заметки',
        body: 'Новое уведомление',
        icon: '/icon-192.png',
        badge: '/icon-192.png'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    // Определяем действия в зависимости от типа уведомления
    let actions = [
        { action: 'open', title: '📂 Открыть' },
        { action: 'close', title: '✖ Закрыть' }
    ];

    // Если это напоминание — добавляем кнопку «Отложить»
    if (data.data && data.data.type === 'reminder') {
        actions = [
            { action: 'snooze', title: '😴 Отложить 5 мин' },
            { action: 'open', title: '📂 Открыть' }
        ];
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200],
        tag: data.tag || 'default',
        renotify: true,
        requireInteraction: data.data && data.data.type === 'reminder',
        data: data.data || { url: '/' },
        actions: actions
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// ==========================================
// ОБРАБОТКА ДЕЙСТВИЙ УВЕДОМЛЕНИЙ
// ==========================================
self.addEventListener('notificationclick', (event) => {
    const action = event.action;
    const notificationData = event.notification.data || {};

    console.log('[SW] Клик по уведомлению. Действие:', action, 'Данные:', notificationData);

    event.notification.close();

    // Действие: Закрыть
    if (action === 'close') {
        return;
    }

    // Действие: Отложить на 5 минут
    if (action === 'snooze') {
        console.log('[SW] Отложить напоминание на 5 минут для заметки:', notificationData.noteId);

        event.waitUntil(
            fetch('/snooze-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noteId: notificationData.noteId,
                    title: event.notification.body,
                    minutes: 5
                })
            })
            .then((res) => res.json())
            .then((result) => {
                console.log('[SW] Напоминание отложено:', result);
                // Показываем подтверждающее уведомление
                return self.registration.showNotification('😴 Отложено', {
                    body: `Напоминание "${event.notification.body}" будет повторено через 5 минут`,
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    tag: 'snooze-confirm',
                    silent: true
                });
            })
            .catch((err) => {
                console.error('[SW] Ошибка при откладывании:', err);
            })
        );
        return;
    }

    // Действие: Открыть (или клик по самому уведомлению)
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            // Ищем уже открытое окно
            for (const client of clients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Открываем новое окно
            if (self.clients.openWindow) {
                const url = notificationData.url || '/';
                return self.clients.openWindow(url);
            }
        })
    );
});

/**
 * Стратегия Network First
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('[SW] Network First: загружено из сети →', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network First: сеть недоступна, ищем в кэше →', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            console.log('[SW] Network First: найдено в кэше →', request.url);
            return cachedResponse;
        }

        console.warn('[SW] Network First: ресурс не найден ни в сети, ни в кэше →', request.url);
        return new Response(
            '<div style="text-align:center;padding:2rem;color:#94a3b8;">Страница недоступна офлайн</div>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
    }
}

/**
 * Стратегия Cache First
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        console.log('[SW] Cache First: найдено в кэше →', request.url);
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok && networkResponse.type === 'basic') {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
            console.log('[SW] Cache First: загружено из сети и закэшировано →', request.url);
        }

        return networkResponse;
    } catch (error) {
        console.warn('[SW] Cache First: ресурс недоступен →', request.url);
        if (request.mode === 'navigate') {
            return caches.match('./index.html');
        }
        return new Response('Ресурс недоступен', { status: 503 });
    }
}
