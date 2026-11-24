#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/gcp.config.sh"

PROXY_PORT="${PROXY_PORT:-5433}"
PROXY_VERSION="${PROXY_VERSION:-v2.8.0}"
LOG_FILE="${LOG_FILE:-/tmp/cloud-sql-proxy-bossorater.log}"

echo "Starting Cloud SQL Proxy (Boss-Rater)..."
echo "  Connection: ${CONNECTION_NAME}"
echo "  Local port: ${PROXY_PORT}"

cd "$SCRIPT_DIR"
if [[ "$(uname -s)" == "Darwin" ]] && command -v xattr >/dev/null 2>&1; then
  xattr -d com.apple.quarantine "./cloud-sql-proxy" 2>/dev/null || true
fi

pkill -f "cloud-sql-proxy.*${CONNECTION_NAME}" 2>/dev/null || true
sleep 1

if [[ ! -f "./cloud-sql-proxy" ]]; then
  echo "Downloading Cloud SQL Proxy ${PROXY_VERSION}..."
  OS="$(uname -s)"
  ARCH="$(uname -m)"
  if [[ "$OS" == "Darwin" ]]; then
    [[ "$ARCH" == "arm64" ]] && S="arm64" || S="amd64"
    curl -fsSL -o cloud-sql-proxy "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/${PROXY_VERSION}/cloud-sql-proxy.darwin.${S}"
  else
    [[ "$ARCH" == "aarch64" ]] && S="arm64" || S="amd64"
    curl -fsSL -o cloud-sql-proxy "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/${PROXY_VERSION}/cloud-sql-proxy.linux.${S}"
  fi
  chmod +x cloud-sql-proxy
fi

./cloud-sql-proxy "${CONNECTION_NAME}" --port "${PROXY_PORT}" >"${LOG_FILE}" 2>&1 &
PID=$!
sleep 3
if ! lsof -i ":${PROXY_PORT}" >/dev/null 2>&1; then
  echo "Proxy failed to listen on ${PROXY_PORT}:"
  tail -30 "${LOG_FILE}" || true
  kill "${PID}" 2>/dev/null || true
  exit 1
fi

echo "Proxy listening on 127.0.0.1:${PROXY_PORT} (PID ${PID})"
echo "  DATABASE_URL=postgresql://${DB_USER}:YOUR_PASSWORD@127.0.0.1:${PROXY_PORT}/${DB_NAME}"
wait "${PID}"
