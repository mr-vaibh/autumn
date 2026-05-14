#!/bin/bash
set -e

FRONTEND_DIR="/Users/vaibhav.shukla/Developer/autumn/frontend"
SERVER="root@143.110.254.237"
REMOTE_STANDALONE="~/autumn/frontend/.next/standalone"

echo "==> Building frontend..."
cd "$FRONTEND_DIR"
npm run build

echo "==> Syncing standalone bundle to server..."

# Sync node_modules (largest, least likely to change — no delete to avoid partial wipe)
rsync -avz "$FRONTEND_DIR/.next/standalone/node_modules/" "$SERVER:$REMOTE_STANDALONE/node_modules/"

# Sync root files: server.js, package.json
rsync -avz \
  "$FRONTEND_DIR/.next/standalone/server.js" \
  "$FRONTEND_DIR/.next/standalone/package.json" \
  "$SERVER:$REMOTE_STANDALONE/"

# Sync .next manifest files (root level)
rsync -avz --delete \
  "$FRONTEND_DIR/.next/standalone/.next/BUILD_ID" \
  "$FRONTEND_DIR/.next/standalone/.next/app-build-manifest.json" \
  "$FRONTEND_DIR/.next/standalone/.next/app-path-routes-manifest.json" \
  "$FRONTEND_DIR/.next/standalone/.next/build-manifest.json" \
  "$FRONTEND_DIR/.next/standalone/.next/package.json" \
  "$FRONTEND_DIR/.next/standalone/.next/prerender-manifest.js" \
  "$FRONTEND_DIR/.next/standalone/.next/prerender-manifest.json" \
  "$FRONTEND_DIR/.next/standalone/.next/react-loadable-manifest.json" \
  "$FRONTEND_DIR/.next/standalone/.next/required-server-files.json" \
  "$FRONTEND_DIR/.next/standalone/.next/routes-manifest.json" \
  "$SERVER:$REMOTE_STANDALONE/.next/"

# Sync server-side page bundles
rsync -avz --delete "$FRONTEND_DIR/.next/standalone/.next/server/" "$SERVER:$REMOTE_STANDALONE/.next/server/"

# Copy static assets (CSS/JS chunks) — not included in standalone by default
rsync -avz --delete "$FRONTEND_DIR/.next/static/" "$SERVER:$REMOTE_STANDALONE/.next/static/"

# Copy public folder
rsync -avz --delete "$FRONTEND_DIR/public/" "$SERVER:$REMOTE_STANDALONE/public/"

echo "==> Restarting frontend service..."
ssh "$SERVER" "systemctl restart autumn-frontend"

echo "==> Done. Site: http://143.110.254.237"
