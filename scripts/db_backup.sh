#!/bin/bash
set -e

set -a; source /root/autumn/.env; set +a

BACKUP_DIR="/root/autumn-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILE="$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h localhost -d "$DB_NAME" | gzip > "$FILE"

echo "Backup saved: $FILE"

find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +5 -delete

echo "Current backups:"
ls -lh "$BACKUP_DIR"
