#!/bin/bash
set -e

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILE="$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" | gzip > "$FILE"

echo "Backup saved: $FILE"

# Delete backups older than 5 days
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +5 -delete

echo "Old backups cleaned up. Current backups:"
ls -lh "$BACKUP_DIR"
