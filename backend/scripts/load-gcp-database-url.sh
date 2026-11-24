#!/usr/bin/env bash
LOAD_GCP_DB_URL_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

load_gcp_database_url() {
  # shellcheck source=/dev/null
  source "${LOAD_GCP_DB_URL_SCRIPT_DIR}/gcp.config.sh"
  local SECRET_NAME="${GCP_DATABASE_URL_SECRET_NAME:-bossorater-database-url}"

  if [[ -n "${DATABASE_URL:-}" ]]; then
    echo "Using DATABASE_URL from environment (skipping Secret Manager)."
    return 0
  fi

  if ! command -v gcloud >/dev/null 2>&1; then
    echo "gcloud CLI not found." >&2
    return 1
  fi

  echo "Loading DATABASE_URL from Secret Manager: ${SECRET_NAME} (project ${GCP_PROJECT_ID})"
  local RAW
  RAW="$(gcloud secrets versions access latest --secret="${SECRET_NAME}" --project="${GCP_PROJECT_ID}")"
  export DATABASE_URL="$(printf '%s' "${RAW//$'\r'/}" | sed -e 's/[[:space:]]*$//')"

  if [[ "${DATABASE_URL}" == *"/cloudsql/"* ]] && [[ ! -d /cloudsql ]]; then
    echo "ERROR: DATABASE_URL uses a Cloud SQL Unix socket. Start the Auth Proxy and use a TCP URL." >&2
    return 1
  fi
  if [[ -z "${DATABASE_URL}" ]]; then
    echo "Secret ${SECRET_NAME} is empty." >&2
    return 1
  fi
}
