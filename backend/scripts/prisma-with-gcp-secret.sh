#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/load-gcp-database-url.sh"

if [[ $# -eq 0 ]]; then
  echo "Usage: $(basename "$0") <prisma subcommand> [args...]" >&2
  exit 1
fi

load_gcp_database_url
cd "${BACKEND}"
exec npx prisma "$@"
