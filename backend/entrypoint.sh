#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL is up!"

echo "Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 1
done
echo "Redis is up!"

echo "Making migrations..."
python manage.py makemigrations users --noinput
python manage.py makemigrations --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating default superuser..."
python manage.py shell << 'PYTHON_SCRIPT'
from apps.users.models import User
email = "admin@autism.school"
password = "Admin@123"
if not User.objects.filter(email=email).exists():
    user = User.objects.create_superuser(
        email=email,
        username="admin",
        password=password,
        first_name="System",
        last_name="Admin",
        role="ADMIN"
    )
    print(f"Superuser created: {email}")
else:
    print(f"Superuser already exists: {email}")
PYTHON_SCRIPT

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Creating sample data..."
python manage.py shell << 'PYTHON_SCRIPT'
from apps.classes.models import AcademicYear
from django.utils import timezone
import datetime

if not AcademicYear.objects.exists():
    current_year = timezone.now().year
    AcademicYear.objects.create(
        name=f"{current_year}-{str(current_year + 1)[-2:]}",
        start_date=datetime.date(current_year, 4, 1),
        end_date=datetime.date(current_year + 1, 3, 31),
        is_current=True
    )
    print("Created current academic year")
PYTHON_SCRIPT

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
