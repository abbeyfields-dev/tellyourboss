#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/gcp.config.sh"

REGION="${GCP_REGION}"
SERVICE="${SERVICE_NAME}"
REPO="${AR_REPO}"
INSTANCE="${CLOUD_SQL_INSTANCE:-${DB_INSTANCE}}"
IMAGE="${REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${REPO}/${SERVICE_NAME}"

echo "Project: ${GCP_PROJECT_ID}  Region: ${REGION}  Service: ${SERVICE}"
gcloud config set account "${GCP_ACCOUNT}"
gcloud config set project "${GCP_PROJECT_ID}"

if ! gcloud artifacts repositories describe "${REPO}" --location="${REGION}" &>/dev/null; then
  echo "Creating Artifact Registry repo: ${REPO}"
  gcloud artifacts repositories create "${REPO}" \
    --repository-format=docker \
    --location="${REGION}" \
    --description="Boss-Rater containers"
fi

echo "Building and pushing ${IMAGE}:latest ..."
gcloud builds submit "${BACKEND}" --tag "${IMAGE}:latest" --project="${GCP_PROJECT_ID}"

if gcloud run services describe "${SERVICE}" --region="${REGION}" --project="${GCP_PROJECT_ID}" &>/dev/null; then
  gcloud run services update "${SERVICE}" \
    --region="${REGION}" \
    --project="${GCP_PROJECT_ID}" \
    --remove-env-vars=PORT \
    --quiet 2>/dev/null || true
fi

CONN="${GCP_PROJECT_ID}:${REGION}:${INSTANCE}"
SECRETS="DATABASE_URL=${GCP_DATABASE_URL_SECRET_NAME}:latest,JWT_SECRET=${GCP_JWT_SECRET_NAME}:latest,JWT_REFRESH_SECRET=${GCP_JWT_REFRESH_SECRET_NAME}:latest"
if gcloud secrets describe bossorater-resend-api-key --project="${GCP_PROJECT_ID}" &>/dev/null; then
  SECRETS="${SECRETS},RESEND_API_KEY=bossorater-resend-api-key:latest"
fi
ENV_FILE="$(mktemp)"
cat > "${ENV_FILE}" << 'EOF'
NODE_ENV: production
SKIP_MIGRATIONS_ON_START: "true"
CORS_ORIGIN: "*"
WEB_APP_URL: https://bossorater.com
MAIL_FROM: "Boss-O-Rater <noreply@bossorater.com>"
EOF
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}:latest" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --env-vars-file "${ENV_FILE}" \
  --set-secrets "${SECRETS}" \
  --cpu-boost \
  --add-cloudsql-instances="${CONN}" \
  --project="${GCP_PROJECT_ID}"

echo ""
gcloud run services describe "${SERVICE}" --region="${REGION}" --format='value(status.url)'
