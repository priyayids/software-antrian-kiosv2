#!/usr/bin/env bash
# Niscaya Antrian — production deploy script for /srv/software-antrian-niscaya
# Runs as root (invoked by the `deploy` user via sudo, NOPASSWD scoped to this file).
# Pulls origin/main, rebuilds + restarts ONLY the app service, health-checks, rolls back on failure.
#
# Usage:
#   sudo /usr/local/bin/niscaya-deploy.sh            # deploy latest
#   sudo /usr/local/bin/niscaya-deploy.sh --dry-run  # fetch + report only, no changes

set -euo pipefail

APP_DIR="/srv/software-antrian-niscaya"
COMPOSE_FILES="-f ${APP_DIR}/docker-compose.yml -f ${APP_DIR}/docker-compose.prod.yml"
SERVICE="app"
HEALTH_URL="http://127.0.0.1:3000/"
LOG="/var/log/niscaya-deploy.log"
HEALTH_TIMEOUT=30

DRY_RUN=0
if [ "${1:-}" = "--dry-run" ]; then
  DRY_RUN=1
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

if [ "$(id -u)" -ne 0 ]; then
  log "ERROR: must run as root (use: sudo /usr/local/bin/niscaya-deploy.sh)"
  exit 1
fi

cd "$APP_DIR"

PREV="$(git rev-parse HEAD)"
log "Deploy start (dry-run=$DRY_RUN): current=$PREV"

git fetch --prune origin main
NEW="$(git rev-parse origin/main)"

if [ "$DRY_RUN" = "1" ]; then
  if [ "$PREV" = "$NEW" ]; then
    log "DRY-RUN: up to date, nothing to deploy"
  else
    log "DRY-RUN: would deploy $NEW (from $PREV)"
    git --no-pager log --oneline "$PREV..$NEW"
  fi
  exit 0
fi

if [ "$PREV" = "$NEW" ]; then
  log "No new commits, rebuilding anyway (safe refresh)"
fi

git reset --hard origin/main
log "Now at: $(git rev-parse --short HEAD)"

log "Building & starting container '${SERVICE}'..."
docker compose $COMPOSE_FILES up -d --build "$SERVICE"

log "Waiting for health at ${HEALTH_URL} (up to ${HEALTH_TIMEOUT}s)..."
for i in $(seq 1 "$HEALTH_TIMEOUT"); do
  if curl -fsS -o /dev/null "$HEALTH_URL"; then
    log "Health OK after ${i}s"
    docker compose $COMPOSE_FILES ps
    log "Deploy completed successfully"
    exit 0
  fi
  sleep 1
done

log "ERROR: health check failed. Rolling back to $PREV ..."
git reset --hard "$PREV"
docker compose $COMPOSE_FILES up -d --build "$SERVICE"
log "Rolled back to $PREV"
exit 1