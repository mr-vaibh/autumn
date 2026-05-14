#!/bin/bash
set -e

APP_DIR="/root/autumn"
cd "$APP_DIR"

set -a; source .env; set +a
export DB_HOST=localhost

echo "==> Installing Python dependencies"
source venv/bin/activate
pip install -q -r backend/requirements.txt

echo "==> Running migrations"
cd backend
DJANGO_SETTINGS_MODULE=config.settings.production DB_HOST=localhost python manage.py migrate --noinput
DJANGO_SETTINGS_MODULE=config.settings.production DB_HOST=localhost python manage.py collectstatic --noinput
cd ..

echo "==> Building frontend"
cd frontend
npm install --prefer-offline -q
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
cd ..

echo "==> Restarting services"
systemctl restart autumn-backend autumn-frontend

echo "==> Done"
