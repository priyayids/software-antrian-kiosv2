#!/usr/bin/env bash
# One-time setup: configure GitHub Actions secrets for the CD workflow.
# Run AFTER `gh auth login`.
#
#   ./scripts/set-secrets.sh
#
# Required env / files:
#   VPS_HOST         (default: reads from ~/.ssh/config, else set manually)
#   VPS_USER         (default: deploy)
#   VPS_PORT         (default: 22)
#   VPS_SSH_KEY_PATH (default: ~/.ssh/vps_deploy_key)

set -euo pipefail

REPO="priyayids/software-antrian-kiosv2"

VPS_HOST="${VPS_HOST:-}"
VPS_USER="${VPS_USER:-deploy}"
VPS_PORT="${VPS_PORT:-22}"
KEY_PATH="${VPS_SSH_KEY_PATH:-$HOME/.ssh/vps_deploy_key}"

if [ -z "$VPS_HOST" ]; then
  VPS_HOST="$(awk '/Host server-vps-deploy/{f=1;next} f&&/HostName/{print $2;exit}' "$HOME/.ssh/config" 2>/dev/null || true)"
fi

if [ -z "$VPS_HOST" ]; then
  echo "ERROR: cannot determine VPS_HOST. Set VPS_HOST=... and re-run." >&2
  exit 1
fi

if [ ! -f "$KEY_PATH" ]; then
  echo "ERROR: SSH key not found at $KEY_PATH" >&2
  exit 1
fi

echo "Configuring secrets for $REPO"
echo "  VPS_HOST   = $VPS_HOST"
echo "  VPS_USER   = $VPS_USER"
echo "  VPS_PORT   = $VPS_PORT"
echo "  SSH key    = $KEY_PATH"

gh secret set VPS_HOST -R "$REPO" --body "$VPS_HOST"
gh secret set VPS_USER -R "$REPO" --body "$VPS_USER"
gh secret set VPS_PORT -R "$REPO" --body "$VPS_PORT"
gh secret set VPS_SSH_KEY -R "$REPO" < "$KEY_PATH"

echo "Done. Push to main (or run the Deploy workflow manually) to deploy."