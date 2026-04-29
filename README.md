# Frontend — Практические работы

> Репозиторий содержит выполненные практические задания по дисциплине «Фронтенд и бэкенд разработка».  
> Каждая папка `practica*` — отдельная работа с собственным стэком технологий и задачами.

---

## Структура проекта

```
frontend-second/
├── practica1/          # №1  — Вёрстка на SASS/SCSS
├── practica2/          # №2  — CRUD API + Клиент
├── practica3/          # №3  — Тестирование API (Postman)
├── practica4-5/        # №4  — Интернет-магазин ZVC (React + Express)
│                       # №5  — Swagger-документация API
├── practica7-8/        # №7  — JWT-аутентификация + Products API
│                       # №8  — (продолжение)
├── practica9-12/       # №9  — RBAC, Products CRUD
│                       # №10 — (продолжение)
│                       # №11 — Панель администратора
│                       # №12 — API Tester
├── practica13-17/      # №13 — PWA, App Shell, Service Worker
│                       # №14 — Offline Mode, кэширование
│                       # №15 — Real-time (Socket.IO)
│                       # №16 — Push-уведомления (VAPID)
│                       # №17 — Напоминания и HTTPS
├── practice19/         # №19 — Users API (Node.js + PostgreSQL)
├── practica20/         # №20 — Users API (Node.js + MongoDB)
├── practica21/         # №21 — REST API с Redis-кэшированием
├── practica22/         # №22 — Балансировка нагрузки (Nginx + HAProxy)
│                       # №23 — Контейнеризация (Docker + Docker Compose)
├── package.json
└── README.md
```

---

## Практическая работа №1 — Вёрстка карточек товаров на SASS

**Директория:** `practica1/`

### Описание
Создание страницы каталога товаров с использованием препроцессора **SASS (SCSS)** и методологии **БЭМ**.

### Что было сделано
- Разработана HTML-страница с каталогом из двух карточек товаров
- Написаны стили на SCSS с использованием:
  - Переменных (`$bg-page`, `$product-card-bg`, `$accent-color` и др.)
  - Миксина `product-card-base` для переиспользования стилей карточки
  - Вложенной структуры (nesting) в соответствии с БЭМ (`&__image`, `&__title`, `&__price`)
  - Медиа-запросов для адаптивности (breakpoint 768px)
- Реализована анимация при наведении на карточку (`transform`, `box-shadow`)
- Обеспечена доступность через `focus-within` и `loading="lazy"`

### Стек технологий
HTML5, SASS/SCSS, методология БЭМ

### Файлы
| Файл | Описание |
|------|----------|
| `index.html` | Главная страница с карточками товаров |
| `scss/style.scss` | Исходные стили на SCSS |
| `css/style.css` | Скомпилированный CSS |
| `img/` | Изображения товаров |

---

## Практическая работа №2 — CRUD API для управления товарами

**Директория:** `practica2/`

### Описание
Разработка серверного REST API и клиентской части для полного управления товарами (создание, чтение, обновление, удаление).

### Что было сделано

#### Серверная часть (`server/server.js`)
- Express.js сервер на порту 3000
- CRUD-эндпоинты: `GET /api/products`, `GET /api/products/:id`, `POST`, `PUT`, `DELETE`
- Валидация входных данных и обработка ошибок
- In-memory хранение данных (массив `products`)

#### Клиентская часть (`index.html` + `js/app.js`)
- Динамическое отображение списка товаров через `fetch` API
- Форма добавления / редактирования товара (режим переключается автоматически)
- Защита от XSS через функцию `escapeHtml`
- SCSS-стили с переменными, миксинами и БЭМ-нотацией

### Стек технологий
**Backend:** Node.js, Express.js, CORS | **Frontend:** HTML5, JavaScript ES6+, Fetch API, SASS/SCSS, БЭМ | **Инструменты:** Nodemon

### Запуск
```bash
cd practica2
npm install
npm run dev
# http://localhost:3000/index.html
```

---

## Практическая работа №3 — Тестирование API в Postman

**Директория:** `practica3/`

### Описание
Тестирование REST API из практической работы №2 с помощью **Postman**. Документирование всех CRUD-операций.

### Что было сделано
- Создана коллекция запросов в Postman: `GET`, `POST`, `PUT`, `DELETE`
- Результаты оформлены в PDF-документе со скриншотами запросов и ответов

### Файлы
| Файл | Описание |
|------|----------|
| `Postman запросы для второй практической работы.pdf` | PDF-отчёт с результатами тестирования |

### Стек технологий
Postman

---

## Практическая работа №4 — Интернет-магазин ZVC (React + Express)

**Директория:** `practica4-5/`

### Описание
Разработка полноценного SPA интернет-магазина **ZVC** (игровые товары) с разделением на клиентскую и серверную части.

### Что было сделано

#### Серверная часть (`server/index.js`)
- Express.js API с расширенной моделью продукта: `id`, `name`, `category`, `description`, `price`, `stock`, `image`, `rating`
- CRUD-эндпоинты, предзаполненный каталог из 10 товаров, валидация полей

#### Клиентская часть (`client/`)
- React SPA на Vite с React Router: `/` — каталог, `/add` — добавление товара
- Компоненты: `Header`, `ProductList`, `ProductCard` (рейтинг звёздами, наличие на складе), `AddProductPage`
- Обработка состояний загрузки и ошибок

### Стек технологий
**Backend:** Node.js, Express.js | **Frontend:** React 18, React Router 6, Vite 5, CSS | **Инструменты:** Nodemon, Concurrently

### Запуск
```bash
# Из корня проекта
npm run install:all
npm run dev
```

---

## Практическая работа №5 — Swagger-документация API

**Директория:** `practica4-5/server/`

### Описание
Интеграция автогенерируемой интерактивной API-документации через **Swagger (OpenAPI 3.0)** в серверную часть ZVC.

### Что было сделано
- Настроены `swagger-jsdoc` и `swagger-ui-express`
- Описана спецификация OpenAPI 3.0 (ZVC Store API v1.0.0)
- Определена схема `Product` со всеми полями и типами данных
- JSDoc-аннотации для каждого эндпоинта: параметры, `requestBody`, ответы (200, 201, 400, 404)

### Документированные эндпоинты
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/products` | Получить все продукты |
| POST | `/api/products` | Добавить новый продукт |
| GET | `/api/products/{id}` | Получить по ID |
| PATCH | `/api/products/{id}` | Обновить по ID |
| DELETE | `/api/products/{id}` | Удалить по ID |

### Запуск
```bash
cd practica4-5/server
npm install && npm run dev
# http://localhost:5001/api-docs
```

---

## Практическая работа №7—8 — JWT-аутентификация + Products API

**Директория:** `practica7-8/`

### Описание
Реализация системы аутентификации на основе **JWT** и полноценного CRUD API для управления товарами с защитой маршрутов.

### Что было сделано
- Регистрация пользователей с хешированием пароля (`bcryptjs`)
- Генерация JWT-токена при входе (`jsonwebtoken`)
- Middleware `authMiddleware.js` для защиты приватных маршрутов
- CRUD-эндпоинты для товаров, доступные только авторизованным пользователям
- Хранение данных в JSON-файле `database.json`

### Эндпоинты
| Маршрут | Доступ | Описание |
|---------|--------|----------|
| `POST /api/auth/register` | Публичный | Регистрация |
| `POST /api/auth/login` | Публичный | Вход, получение токена |
| `GET /api/auth/me` | JWT | Данные текущего пользователя |
| `GET /api/products` | JWT | Список товаров |
| `POST /api/products` | JWT | Создать товар |
| `PUT /api/products/:id` | JWT | Обновить товар |
| `DELETE /api/products/:id` | JWT | Удалить товар |

### Стек технологий
Node.js, Express.js, bcryptjs, jsonwebtoken, CORS

### Запуск
```bash
cd practica7-8
npm install && node index.js
# http://localhost:3000
```

---

## Практическая работа №9—12 — Fullstack: RBAC, Admin Panel, API Tester

**Директория:** `practica9-12/`

### Описание
Полноценное fullstack-приложение интернет-магазина с системой ролей, панелью администратора и встроенным тестером API.

### Что было сделано

#### Практика №9—10 — RBAC и Products CRUD
- **Система ролей (RBAC):** 4 уровня доступа: `Гость`, `Пользователь`, `Продавец`, `Администратор`
- Middleware `roleMiddleware.js` — ограничение доступа на уровне сервера
- Защищённые CRUD-эндпоинты для товаров
- React: поиск и фильтрация товаров, динамический UI (кнопки появляются по роли)
- HOC `ProtectedRoute` с поддержкой массива `allowedRoles`
- Refresh-токены: пара Access (15 мин) + Refresh (7 дней), автообновление через Axios interceptors

#### Практика №11—12 — Admin Panel и API Tester
- Страница управления пользователями (смена ролей, бан/разбан)
- Встроенный API Tester: тестирование всех эндпоинтов без Postman, автоподстановка токенов, cURL-команды, время отклика, статус-коды
- Страница 403 `UnauthorizedPage` при недостатке прав
- Статусные бейджи ролей в Navbar

### Стек технологий
**Backend:** Node.js, Express.js, bcryptjs, jsonwebtoken | **Frontend:** React 18, React Router 6, Vite, Axios | **Данные:** JSON-файл

### Запуск
```bash
cd practica9-12
npm install && node index.js      # сервер: http://localhost:3000
cd client && npm install && npm run dev   # клиент: http://localhost:5173
```

---

## Практическая работа №13—17 — PWA Notes

**Директория:** `practica13-17/`

### Описание
Прогрессивное веб-приложение (PWA) для создания заметок с системой напоминаний, Real-time обновлениями и Push-уведомлениями на архитектуре **App Shell**.

### Что было сделано
- **App Shell** — мгновенная загрузка оболочки приложения из кэша
- **Offline Mode** — полная работа без интернета через Service Worker (Cache First + Network First)
- **Real-time** — синхронизация заметок между вкладками через Socket.IO
- **Push-уведомления** — Web Push API (VAPID), работают при закрытом браузере
- **Напоминания** — таймеры на сервере, пуш точно в срок
- **HTTPS** — самоподписанный TLS-сертификат + HTTP для локальной разработки

### Стек технологий
**Frontend:** HTML5, CSS3, JavaScript ES6+ | **Backend:** Node.js, Express | **PWA:** Service Worker, Web Manifest | **Real-time:** Socket.IO | **Push:** web-push (VAPID)

### Файлы
| Файл | Описание |
|------|----------|
| `server.js` | HTTP/HTTPS сервер, VAPID-конфиг, логика напоминаний |
| `sw.js` | Service Worker: кэш, обработка Push |
| `app.js` | Клиент: Socket.IO, регистрация SW, DOM |
| `index.html` | App Shell |
| `pages/` | Динамические фрагменты (notes, about) |
| `certs/` | TLS-ключи (key.pem, cert.pem) |

### Запуск
```bash
cd practica13-17
npm install && node server.js
# HTTP:  http://localhost:3000   (рекомендуется для разработки)
# HTTPS: https://localhost:3443
```

---

## Практическая работа №19 — Users API (Node.js + PostgreSQL)

**Директория:** `practice19/`

### Описание
REST API для управления пользователями с использованием **PostgreSQL** в качестве базы данных (драйвер `pg`).

### Что было сделано
- Пул соединений `pg.Pool` с конфигурацией через `.env`
- Инициализация схемы БД из `schema.sql` (`npm run db:init`)
- CRUD-эндпоинты для сущности `users`
- Поля: `id` (SERIAL PK), `first_name`, `last_name`, `age` (0–150), `created_at`, `updated_at` (Unix-время)

### Эндпоинты
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/users` | Создать пользователя |
| GET | `/api/users` | Список всех пользователей |
| GET | `/api/users/:id` | Получить по id |
| PATCH | `/api/users/:id` | Частичное обновление |
| DELETE | `/api/users/:id` | Удалить |

### Стек технологий
Node.js, Express.js, PostgreSQL, pg

### Запуск
```bash
cd practice19
cp .env.example .env    # указать параметры PostgreSQL
createdb practice19
npm install && npm run db:init
npm run dev
# http://localhost:3000
```

---

## Практическая работа №20 — Users API (Node.js + MongoDB)

**Директория:** `practica20/`

### Описание
REST API для управления пользователями с использованием **MongoDB** через ODM **Mongoose**. Аналог практики №19, но с документо-ориентированной БД.

### Что было сделано
- Подключение к MongoDB через Mongoose (`mongoose.connect`)
- Mongoose-схема и модель `User` с полями `first_name`, `last_name`, `age`
- Валидация полей на уровне модели (обязательность, диапазон возраста 0–150)
- Полный CRUD с проверкой входных данных

### Эндпоинты
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/users` | Создать пользователя |
| GET | `/api/users` | Список всех пользователей |
| GET | `/api/users/:id` | Получить по id |
| PATCH | `/api/users/:id` | Частичное обновление |
| DELETE | `/api/users/:id` | Удалить |

### Стек технологий
Node.js, Express.js, MongoDB, Mongoose, dotenv, Nodemon

### Запуск
```bash
cd practica20
npm install && npm run dev
# MongoDB должен быть запущен на 127.0.0.1:27017
# http://localhost:3000
```

---

## Практическая работа №21 — REST API с Redis-кэшированием

**Директория:** `practica21/`

### Описание
REST API с JWT-аутентификацией, RBAC и кэшированием ответов через **Redis**. При повторных запросах данные берутся из памяти без обращения к БД.

### Что было сделано
- JWT-аутентификация: регистрация, вход, refresh-токен, middleware защиты маршрутов
- RBAC: роли `user`, `seller`, `admin`
- `cacheMiddleware` — проверяет Redis перед контроллером, возвращает кэш мгновенно
- `saveToCache` — сохраняет результат с TTL после первого обращения к данным
- `invalidateCache` — удаляет устаревшие ключи при изменении данных (PUT/DELETE)

### Кэш-стратегия
| Ресурс | Ключ Redis | TTL |
|--------|-----------|-----|
| Список товаров | `products:all` | 10 минут |
| Товар по id | `products:{id}` | 10 минут |
| Список пользователей | `users:all` | 1 минута |
| Пользователь по id | `users:{id}` | 1 минута |

### Стек технологий
Node.js, Express.js, Redis (v4), bcryptjs, jsonwebtoken

### Запуск
```bash
brew services start redis    # запустить Redis
cd practica21
npm install && node index.js
# http://localhost:3000
```

---

## Практическая работа №22 — Балансировка нагрузки (Nginx + HAProxy)

**Директория:** `practica22/`

### Описание
Тестовая система балансировки нагрузки: три Node.js backend-сервера, **Nginx** и **HAProxy** в роли балансировщиков, запускаемые локально через shell-скрипты.

### Что было сделано
- Три Express-сервера на портах `3001`, `3002` (основные) и `3003` (резервный)
- **Nginx** (порт `8080`) — Round Robin + `max_fails=2 fail_timeout=30s` + `backup`-сервер
- **HAProxy** (порт `8081`) — Round Robin + `option httpchk GET /health` + `backup`
- Протестированы: распределение запросов между серверами и failover при отключении узла

### Архитектура
```
Клиент
  ├──> Nginx  :8080  ──┐
  └──> HAProxy:8081  ──├──> Server 1 :3001  (основной)
                       ├──> Server 2 :3002  (основной)
                       └──> Server 3 :3003  (резервный backup)
```

### Конфигурация Nginx (`nginx/nginx.conf`)
```nginx
upstream backend {
    server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3003 backup;
}
```

### Стек технологий
Node.js, Express.js, Nginx 1.29, HAProxy 3.3

### Запуск
```bash
cd practica22
npm install
bash start.sh    # запускает все серверы + Nginx + HAProxy
bash stop.sh     # останавливает всё

# Тест Round Robin
for i in {1..6}; do curl -s http://localhost:8080/; echo; done
```

---

## Практическая работа №23 — Контейнеризация приложений (Docker)

**Директория:** `practica22/` (Docker-файлы совмещены с практикой №22)

### Описание
Контейнеризация backend-серверов и балансировщиков нагрузки с помощью **Docker** и **Docker Compose**. Все сервисы из практики №22 упакованы в контейнеры и запускаются единой командой.

### Что было сделано
- `Dockerfile` — сборка образа на базе `node:20-alpine`, только production-зависимости
- `docker-compose.yml` — оркестрация 5 сервисов: backend1, backend2, backend3 (резервный), nginx, haproxy
- Общая Docker-сеть `app-net` — контейнеры обращаются друг к другу по имени сервиса
- `nginx/nginx.docker.conf` и `haproxy/haproxy.docker.cfg` — конфиги для Docker-окружения (имена сервисов вместо 127.0.0.1)
- Проверена балансировка: Round Robin между контейнерами виден по полю `hostname` в ответе

### Архитектура Docker Compose
```
nginx:8080  ──┐
              ├──> backend1 (контейнер, порт 3000)
haproxy:8081──┤
              ├──> backend2 (контейнер, порт 3000)
              │
              └──> backend3 (резервный контейнер)
```

### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY backend/server.js ./backend/server.js
EXPOSE 3000
CMD ["node", "backend/server.js"]
```

### Стек технологий
Docker, Docker Compose, Node.js, Nginx (alpine), HAProxy (alpine)

### Запуск
```bash
cd practica22
docker compose up --build -d     # сборка и запуск всех контейнеров
docker compose ps                 # статус контейнеров
docker compose logs -f            # логи в реальном времени
docker compose down               # остановка и удаление контейнеров

# Тест Round Robin через Docker
for i in {1..6}; do curl -s http://localhost:8080/; echo; done
```

---

## Общий стек технологий

| Технология | Где используется |
|------------|-----------------|
| HTML5 / CSS3 | Все работы |
| SASS/SCSS | Практические 1, 2 |
| JavaScript (ES6+) | Все работы |
| Node.js | Практические 2, 4, 5, 7—23 |
| Express.js | Практические 2, 4, 5, 7—23 |
| React 18 | Практические 4, 9—12 |
| React Router 6 | Практические 4, 9—12 |
| Vite | Практические 4, 9—12 |
| JWT | Практические 7—12, 21 |
| RBAC | Практические 9—12, 21 |
| Axios | Практические 9—12 |
| Swagger / OpenAPI | Практическая 5 |
| Postman | Практическая 3 |
| БЭМ (методология) | Практические 1, 2 |
| PostgreSQL | Практическая 19 |
| MongoDB / Mongoose | Практическая 20 |
| Redis | Практическая 21 |
| Nginx | Практические 22, 23 |
| HAProxy | Практические 22, 23 |
| Docker / Docker Compose | Практическая 23 |
| Service Worker / PWA | Практические 13—17 |
| Socket.IO | Практические 13—17 |
| Web Push (VAPID) | Практические 13—17 |

---

## Автор

Савельев Антон ЭФБО-12-24
