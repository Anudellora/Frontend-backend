#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Запуск backend-серверов..."
PORT=3001 node "$SCRIPT_DIR/backend/server.js" &
echo $! > "$SCRIPT_DIR/.pid_3001"

PORT=3002 node "$SCRIPT_DIR/backend/server.js" &
echo $! > "$SCRIPT_DIR/.pid_3002"

PORT=3003 node "$SCRIPT_DIR/backend/server.js" &
echo $! > "$SCRIPT_DIR/.pid_3003"

sleep 1
echo "    Сервер 1: http://localhost:3001"
echo "    Сервер 2: http://localhost:3002"
echo "    Резерв  : http://localhost:3003"

echo ""
echo "==> Запуск Nginx (порт 8080)..."
nginx -c "$SCRIPT_DIR/nginx/nginx.conf" -p "$SCRIPT_DIR/nginx"
echo "    Nginx: http://localhost:8080"

echo ""
echo "==> Запуск HAProxy (порт 8081)..."
haproxy -f "$SCRIPT_DIR/haproxy/haproxy.cfg" -D -p "$SCRIPT_DIR/.pid_haproxy"
echo "    HAProxy: http://localhost:8081"

echo ""
echo "Все сервисы запущены."
echo "Тест Nginx:   curl http://localhost:8080/"
echo "Тест HAProxy: curl http://localhost:8081/"
