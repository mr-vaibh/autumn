#!/bin/bash
set -e

FRONTEND_DIR="/Users/vaibhav.shukla/Developer/autumn/frontend"
SERVER="root@143.110.254.237"
REMOTE_DIR="~/autumn/frontend"

echo "==> Building frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "==> Syncing to server..."
# Sync standalone bundle (the only thing needed to run the server)
rsync -avz --delete "$FRONTEND_DIR/.next/standalone/" "$SERVER:$REMOTE_DIR/.next/standalone/"
# Copy server files into standalone (needed by Next.js runtime)
rsync -avz "$FRONTEND_DIR/.next/server/" "$SERVER:$REMOTE_DIR/.next/standalone/.next/server/"
# Copy static assets and public files
rsync -avz "$FRONTEND_DIR/.next/static/" "$SERVER:$REMOTE_DIR/.next/standalone/.next/static/"
rsync -avz "$FRONTEND_DIR/public/" "$SERVER:$REMOTE_DIR/.next/standalone/public/"

echo "==> Restarting frontend service..."
ssh "$SERVER" "systemctl restart autumn-frontend"

echo "==> Done. Site: http://143.110.254.237:3000"
