# Практическая работа №19 — Users API (Node.js + PostgreSQL)

REST API для управления пользователями. Стек: **Node.js**, **Express**, **PostgreSQL** (драйвер `pg`).

## Структура

```
practice19/
├── src/
│   ├── server.js           # точка входа, Express
│   ├── routes/users.js     # CRUD для /api/users
│   └── db/
│       ├── pool.js         # пул соединений pg
│       ├── schema.sql      # DDL таблицы users
│       └── init.js         # выполняет schema.sql
├── .env.example
└── package.json
```

## Сущность `users`

| Поле        | Тип         | Описание                              |
| ----------- | ----------- | ------------------------------------- |
| id          | SERIAL PK   | Уникальный идентификатор              |
| first_name  | VARCHAR     | Имя                                   |
| last_name   | VARCHAR     | Фамилия                               |
| age         | INTEGER     | Возраст (0–150)                       |
| created_at  | BIGINT      | Unix-время создания (секунды)         |
| updated_at  | BIGINT      | Unix-время последнего обновления      |

## Эндпоинты

| Метод  | Путь             | Описание                           |
| ------ | ---------------- | ---------------------------------- |
| POST   | `/api/users`     | Создать пользователя               |
| GET    | `/api/users`     | Список пользователей               |
| GET    | `/api/users/:id` | Получить пользователя по id        |
| PATCH  | `/api/users/:id` | Частичное обновление пользователя  |
| DELETE | `/api/users/:id` | Удалить пользователя               |

## Запуск

1. Скопировать `.env.example` в `.env` и указать параметры PostgreSQL.
2. Создать БД (если ещё не создана):
   ```bash
   createdb practice19
   ```
3. Установить зависимости и инициализировать схему:
   ```bash
   npm install
   npm run db:init
   ```
4. Запустить сервер:
   ```bash
   npm run dev
   # http://localhost:3000
   ```

## Примеры запросов (curl)

```bash
# Создание
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Anton","last_name":"Savelev","age":20}'

# Список
curl http://localhost:3000/api/users

# Один
curl http://localhost:3000/api/users/1

# Обновление
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"age":21}'

# Удаление
curl -X DELETE http://localhost:3000/api/users/1
```
