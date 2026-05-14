#!/bin/bash
set -e

FRONTEND_DIR="/Users/vaibhav.shukla/Developer/autumn/frontend"
SERVER="root@143.110.254.237"
REMOTE_STANDALONE="~/autumn/frontend/.next/standalone"

echo "==> Building frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "==> Syncing standalone bundle to server..."
# The standalone directory contains everything needed — sync it as-is
rsync -avz --delete "$FRONTEND_DIR/.next/standalone/" "$SERVER:$REMOTE_STANDALONE/"

# Copy static assets (CSS/JS chunks) — not included in standalone by default
rsync -avz "$FRONTEND_DIR/.next/static/" "$SERVER:$REMOTE_STANDALONE/.next/static/"

# Copy public folder
rsync -avz "$FRONTEND_DIR/public/" "$SERVER:$REMOTE_STANDALONE/public/"

echo "==> Restarting frontend service..."
ssh "$SERVER" "systemctl restart autumn-frontend"

echo "==> Done. Site: http://143.110.254.237:3000"
