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

echo "==> Ensuring admin user exists"
DJANGO_SETTINGS_MODULE=config.settings.production DB_HOST=localhost python manage.py shell << 'PYTHON'
import os
from apps.users.models import User
email = os.environ.get("DEFAULT_ADMIN_EMAIL")
password = os.environ.get("DEFAULT_ADMIN_PASSWORD")
if not email or not password:
    print("DEFAULT_ADMIN_EMAIL or DEFAULT_ADMIN_PASSWORD not set, skipping admin creation")
elif not User.objects.filter(email=email).exists():
    User.objects.create_superuser(username="admin", email=email, password=password, role="ADMIN")
    print(f"Admin created: {email}")
else:
    print(f"Admin already exists: {email}")
PYTHON
cd ..

echo "==> Restarting backend"
systemctl restart autumn-backend

echo "==> Updating nginx config"
cp "$APP_DIR/nginx/nginx.conf" /etc/nginx/nginx.conf
nginx -t && systemctl reload nginx

echo "==> Installing chores (idempotent)"

# DB backup cron — daily at 2 AM
CRON_JOB="0 2 * * * bash /root/autumn/scripts/db_backup.sh >> /root/autumn/logs/backup.log 2>&1"
( crontab -l 2>/dev/null | grep -qF "db_backup.sh" ) \
  || ( crontab -l 2>/dev/null; echo "$CRON_JOB" ) | crontab -

# Log rotation
cp "$APP_DIR/config/logrotate-autumn.conf" /etc/logrotate.d/autumn

echo "==> Done"
