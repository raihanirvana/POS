#!/usr/bin/env bash
set -euo pipefail

render_cli="${RENDER_CLI:-$(command -v render || true)}"
if [[ -z "$render_cli" && -x "$HOME/.local/bin/render" ]]; then
  render_cli="$HOME/.local/bin/render"
fi
if [[ -z "$render_cli" ]]; then
  printf '%s\n' 'Install Render CLI: https://render.com/docs/cli' >&2
  exit 1
fi

case "${1:-}" in
  --login)
    exec "$render_cli" login
    ;;
  --create)
    exec "$render_cli" services create \
      --name "${RENDER_SERVICE_NAME:-seduh-pos}" \
      --type web_service \
      --runtime node \
      --repo https://github.com/raihanirvana/POS.git \
      --branch main \
      --region singapore \
      --plan free \
      --build-command 'npm ci --include=dev && npm run check' \
      --start-command 'npm start' \
      --health-check-path /api/health \
      --auto-deploy=true \
      --env-var NODE_VERSION=22.20.0 \
      --env-var NODE_ENV=production \
      --env-var HOST=0.0.0.0 \
      --env-var TRUST_PROXY=1 \
      --env-var DATABASE_PATH=./data/seduh.sqlite \
      --env-var VITE_DEMO_EPHEMERAL_STORAGE=true \
      --output json --confirm
    ;;
  '')
    if [[ -z "${RENDER_SERVICE_ID:-}" ]]; then
      printf '%s\n' 'Isi RENDER_SERVICE_ID untuk redeploy service yang sudah dibuat.' >&2
      printf '%s\n' 'Deploy pertama: npm run deploy:render -- --create' >&2
      exit 1
    fi
    exec "$render_cli" deploys create "$RENDER_SERVICE_ID" --wait --output json --confirm
    ;;
  *)
    printf '%s\n' 'Pemakaian: npm run deploy:render [-- --create|--login]' >&2
    exit 1
    ;;
esac
