#!/bin/bash
set -e

APP_DIR="/root/autumn"
cd "$APP_DIR"

echo "==> Loading env"
set -a; source .env; set +a
export DB_HOST=localhost

echo "==> Installing system packages"
apt update -q
apt install -y postgresql postgresql-contrib redis-server python3-pip python3-venv nginx curl build-essential libpq-dev

echo "==> Installing Node.js 20"
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt install -y nodejs
fi

echo "==> Setting up PostgreSQL"
systemctl enable postgresql
systemctl start postgresql
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"

echo "==> Setting up Python venv"
python3 -m venv venv
source venv/bin/activate
pip install -q -r backend/requirements.txt
pip install -q gunicorn

echo "==> Running migrations"
cd backend
DJANGO_SETTINGS_MODULE=config.settings.production DB_HOST=localhost python manage.py migrate --noinput
DJANGO_SETTINGS_MODULE=config.settings.production DB_HOST=localhost python manage.py collectstatic --noinput
cd ..

echo "==> Building frontend"
cd frontend
npm install --prefer-offline -q
npm run build
mkdir -p .next/standalone/public .next/standalone/.next/static
cp -r public/. .next/standalone/public/
cp -r .next/static/. .next/standalone/.next/static/
cd ..

echo "==> Installing systemd services"
cp systemd/autumn-backend.service /etc/systemd/system/
cp systemd/autumn-frontend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable autumn-backend autumn-frontend redis

echo "==> Configuring nginx"
cp nginx/nginx.local.conf /etc/nginx/nginx.conf
nginx -t
systemctl enable nginx

echo "==> Setting up daily DB backup cron"
CRON="0 2 * * * /root/autumn/scripts/db_backup.sh >> /root/autumn/logs/backup.log 2>&1"
( crontab -l 2>/dev/null | grep -v db_backup; echo "$CRON" ) | crontab -

mkdir -p logs

echo "==> Starting services"
systemctl restart redis autumn-backend autumn-frontend nginx

echo ""
echo "Done! App running at http://$(curl -s ifconfig.me)"
