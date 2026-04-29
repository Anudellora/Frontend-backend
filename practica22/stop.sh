#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Остановка backend-серверов..."
for pid_file in "$SCRIPT_DIR"/.pid_300*; do
  [ -f "$pid_file" ] && kill "$(cat "$pid_file")" 2>/dev/null && rm "$pid_file"
done

echo "==> Остановка Nginx..."
nginx -c "$SCRIPT_DIR/nginx/nginx.conf" -p "$SCRIPT_DIR/nginx" -s stop 2>/dev/null || true

echo "==> Остановка HAProxy..."
[ -f "$SCRIPT_DIR/.pid_haproxy" ] && kill "$(cat "$SCRIPT_DIR/.pid_haproxy")" 2>/dev/null && rm "$SCRIPT_DIR/.pid_haproxy" || true

echo "Все сервисы остановлены."
