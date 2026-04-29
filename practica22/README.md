# Практическая работа №22 — Балансировка нагрузки (Nginx + HAProxy)

Реализация тестовой системы балансировки нагрузки с тремя backend-серверами (Node.js + Express), Nginx и HAProxy в роли балансировщиков.

---

## Структура проекта

```
practica22/
├── backend/
│   └── server.js          # Express-сервер, запускается на любом PORT
├── nginx/
│   └── nginx.conf         # Конфигурация Nginx: upstream + health checks
├── haproxy/
│   └── haproxy.cfg        # Конфигурация HAProxy: roundrobin + health checks
├── start.sh               # Запуск всех сервисов
├── stop.sh                # Остановка всех сервисов
└── package.json
```

---

## Архитектура

```
Клиент
  │
  ├──> Nginx  :8080  ──┐
  │                    ├──> Server 1 :3001 (основной)
  └──> HAProxy:8081  ──┤
                       ├──> Server 2 :3002 (основной)
                       │
                       └──> Server 3 :3003 (резервный backup)
```

---

## Конфигурация Nginx

Алгоритм: **Round Robin** (по умолчанию).

```nginx
upstream backend {
    server 127.0.0.1:3001 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3002 max_fails=2 fail_timeout=30s;
    server 127.0.0.1:3003 backup;
}

server {
    listen 8080;
    location / {
        proxy_pass http://backend;
    }
}
```

- `max_fails=2` — сервер считается недоступным после 2 неудачных попыток
- `fail_timeout=30s` — недоступный сервер исключается на 30 секунд
- `backup` — резервный сервер, подключается при отказе основных

---

## Конфигурация HAProxy

```
frontend http_front
    bind *:8081
    default_backend http_back

backend http_back
    balance roundrobin
    option httpchk GET /health
    server server1 127.0.0.1:3001 check
    server server2 127.0.0.1:3002 check
    server server3 127.0.0.1:3003 check backup
```

- `balance roundrobin` — алгоритм Round Robin
- `option httpchk GET /health` — проверка доступности через HTTP GET /health
- `check` — активные health-checks на каждом сервере

---

## Установка и запуск

### 1. Установить зависимости

```bash
cd practica22
npm install
```

### 2. Убедиться, что Nginx и HAProxy установлены

```bash
brew install nginx haproxy
```

### 3. Запустить все сервисы

```bash
bash start.sh
```

Запустятся:
- Backend-серверы: `http://localhost:3001`, `http://localhost:3002`, `http://localhost:3003`
- Nginx: `http://localhost:8080`
- HAProxy: `http://localhost:8081`

### 4. Остановить все сервисы

```bash
bash stop.sh
```

---

## Тестирование

### Round Robin (запросы чередуются между серверами)

```bash
for i in {1..6}; do curl -s http://localhost:8080/; echo; done
```

Результат: запросы поочерёдно обрабатываются сервером `3001` и `3002`.

### Отказоустойчивость (failover)

1. Остановить сервер 3001:
```bash
kill $(cat .pid_3001)
```

2. Проверить, что все запросы уходят на сервер 3002:
```bash
for i in {1..4}; do curl -s http://localhost:8080/; echo; done
```

### Тест резервного сервера (backup)

1. Остановить оба основных сервера (3001 и 3002)
2. Запросы автоматически перейдут на резервный сервер 3003

### Тестирование HAProxy

```bash
for i in {1..6}; do curl -s http://localhost:8081/; echo; done
```

---

## Эндпоинты backend-сервера

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Ответ с номером порта и счётчиком запросов |
| GET | `/health` | Health check (статус сервера) |

---

## Стек технологий

| Технология | Назначение |
|------------|-----------|
| Node.js + Express | Backend-серверы |
| Nginx 1.29 | Основной балансировщик (порт 8080) |
| HAProxy 3.3 | Альтернативный балансировщик (порт 8081) |

---

## Автор

Савельев Антон ЭФБО-12-24
