# Практическая работа №20 — Users API (Node.js + MongoDB)

REST API для управления пользователями. Стек: **Node.js**, **Express**, **MongoDB**, **mongoose**.

## Структура

```
practica20/
├── src/
│   ├── server.js              # точка входа, Express
│   ├── routes/users.js        # CRUD для /api/users
│   ├── models/User.js         # Mongoose-схема + автоинкремент id
│   └── db/connect.js          # подключение к MongoDB
├── .env.example
└── package.json
```

## Сущность `User`

| Поле        | Тип       | Описание                              |
| ----------- | --------- | ------------------------------------- |
| id          | Number    | Уникальный числовой ID (автоинкремент через Counter-коллекцию) |
| first_name  | String    | Имя                                   |
| last_name   | String    | Фамилия                               |
| age         | Number    | Возраст (0–150)                       |
| created_at  | Number    | Unix-время создания (секунды)         |
| updated_at  | Number    | Unix-время последнего обновления      |

## Эндпоинты

| Метод  | Путь             | Описание                           |
| ------ | ---------------- | ---------------------------------- |
| POST   | `/api/users`     | Создать пользователя               |
| GET    | `/api/users`     | Список пользователей               |
| GET    | `/api/users/:id` | Получить пользователя по id        |
| PATCH  | `/api/users/:id` | Частичное обновление               |
| DELETE | `/api/users/:id` | Удалить пользователя               |

## Установка MongoDB

### Вариант A — Docker (используется в этой работе)

На macOS 26 (Tahoe) Homebrew не смог поставить `mongodb-community`: формула не имеет готового bottle, а для сборки из исходников нужны обновлённые Xcode Command Line Tools. Самый быстрый путь — запустить MongoDB в контейнере:

```bash
# Docker Desktop должен быть запущен.
docker run -d \
  --name practica20-mongo \
  --restart unless-stopped \
  -p 27017:27017 \
  -v practica20-mongo-data:/data/db \
  mongo:7

# Проверка:
docker exec practica20-mongo mongosh --quiet --eval 'db.runCommand({ping:1})'
# -> { ok: 1 }
```

Контейнер публикует порт `27017` на хост, данные сохраняются в именованном volume `practica20-mongo-data` и переживают перезапуск Docker.

Полезные команды:
```bash
docker stop practica20-mongo    # остановить
docker start practica20-mongo   # запустить снова
docker logs -f practica20-mongo # логи
```

### Вариант B — Homebrew (если Xcode 26 актуален)

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

В обоих вариантах MongoDB слушает `mongodb://127.0.0.1:27017` без аутентификации — именно этот адрес используется в `.env.example`.

## Запуск приложения

```bash
cd practica20
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
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
