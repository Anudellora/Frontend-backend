/**
 * Service Worker для PWA To-Do List
 * Реализует стратегию "Cache First, falling back to Network"
 */

const CACHE_NAME = 'todo-pwa-cache-v4';

// Ресурсы для предварительного кэширования
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-256.png',
    './icon-512.png',
    './screenshot-desktop.png',
    './screenshot-mobile.png'
];

/**
 * Этап установки: Кэширование статических ресурсов
 */
self.addEventListener('install', (event) => {
    // Заставляем Service Worker активироваться немедленно (опционально, но полезно для PWA)
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Кэш открыт, кэшируем статику');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Ошибка при кэшировании:', error);
            })
    );
});

/**
 * Этап активации: Очистка старых кэшей
 */
self.addEventListener('activate', (event) => {
    // Service Worker начинает контролировать страницы немедленно
    event.waitUntil(self.clients.claim());

    const cacheAllowlist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Если кэш не в белом списке, удаляем его
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        console.log('Удаляем старый кэш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

/**
 * Этап перехвата запросов: Стратегия "Cache First, falling back to Network"
 */
self.addEventListener('fetch', (event) => {
    // Игнорируем запросы не по HTTP/HTTPS (например, chrome-extension://)
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем ответ из кэша, если он найден
                if (response) {
                    return response;
                }

                // Иначе клонируем запрос и делаем запрос к сети
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((networkResponse) => {
                    // Проверяем валидность ответа
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Клонируем ответ для кэширования
                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return networkResponse;
                }).catch(() => {
                    console.log('Запрос не удался (офлайн), и ресурса нет в кэше:', event.request.url);
                });
            })
    );
});
