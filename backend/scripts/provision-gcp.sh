#!/usr/bin/env bash
# Create the bossorater GCP project, Cloud SQL (Navayro-like), secrets, and first Cloud Run deploy.
# Requires an interactive login: gcloud auth login --account=founders@navayro.com
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$(cd "${SCRIPT_DIR}/.." && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/gcp.config.sh"

echo "Provisioning Boss-Rater on ${GCP_ACCOUNT} / project ${GCP_PROJECT_ID}"
gcloud config set account "${GCP_ACCOUNT}"

ACTIVE_ACCOUNT="$(gcloud config get-value account 2>/dev/null || true)"
if [[ "${ACTIVE_ACCOUNT}" != "${GCP_ACCOUNT}" ]]; then
  echo "Active gcloud account is '${ACTIVE_ACCOUNT}', expected ${GCP_ACCOUNT}."
  echo "Run: gcloud auth login --account=${GCP_ACCOUNT}"
  exit 1
fi

if ! gcloud projects describe "${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  echo "Creating project ${GCP_PROJECT_ID}..."
  CREATE=(gcloud projects create "${GCP_PROJECT_ID}" --name="Boss-Rater")
  if ORG_ID="$(gcloud projects describe "${SOURCE_PROJECT_ID}" --format='value(parent.id)' 2>/dev/null)"; then
    PARENT_TYPE="$(gcloud projects describe "${SOURCE_PROJECT_ID}" --format='value(parent.type)' 2>/dev/null || true)"
    if [[ "${PARENT_TYPE}" == "organization" && -n "${ORG_ID}" ]]; then
      CREATE+=(--organization="${ORG_ID}")
    elif [[ "${PARENT_TYPE}" == "folder" && -n "${ORG_ID}" ]]; then
      CREATE+=(--folder="${ORG_ID}")
    fi
  fi
  "${CREATE[@]}"
else
  echo "Project ${GCP_PROJECT_ID} already exists."
fi

gcloud config set project "${GCP_PROJECT_ID}"

BILLING_ACCOUNT="$(gcloud billing projects describe "${SOURCE_PROJECT_ID}" --format='value(billingAccountName)' 2>/dev/null | awk -F/ '{print $NF}')"
if [[ -z "${BILLING_ACCOUNT}" ]]; then
  BILLING_ACCOUNT="$(gcloud billing accounts list --format='value(ACCOUNT_ID)' --filter='open=true' | head -n 1)"
fi
if [[ -z "${BILLING_ACCOUNT}" ]]; then
  echo "Could not find a billing account. Link one in the Cloud Console, then re-run."
  exit 1
fi
echo "Linking billing account ${BILLING_ACCOUNT}"
gcloud billing projects link "${GCP_PROJECT_ID}" --billing-account="${BILLING_ACCOUNT}"

echo "Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  compute.googleapis.com \
  --project="${GCP_PROJECT_ID}"

if ! gcloud sql instances describe "${DB_INSTANCE}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  echo "Creating Cloud SQL ${DB_INSTANCE} (${DB_VERSION}, ${DB_TIER}, ${GCP_REGION})..."
  ROOT_PASS="$(openssl rand -base64 24)"
  gcloud sql instances create "${DB_INSTANCE}" \
    --project="${GCP_PROJECT_ID}" \
    --database-version="${DB_VERSION}" \
    --tier="${DB_TIER}" \
    --region="${GCP_REGION}" \
    --storage-type=SSD \
    --storage-size=10GB \
    --availability-type=ZONAL \
    --backup-start-time=09:00 \
    --retained-backups-count=7 \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=9 \
    --root-password="${ROOT_PASS}"
else
  echo "Cloud SQL instance ${DB_INSTANCE} already exists."
fi

if ! gcloud sql databases describe "${DB_NAME}" --instance="${DB_INSTANCE}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1; then
  gcloud sql databases create "${DB_NAME}" --instance="${DB_INSTANCE}" --project="${GCP_PROJECT_ID}"
fi

DB_PASS="${DB_PASS:-$(openssl rand -base64 24)}"
if ! gcloud sql users list --instance="${DB_INSTANCE}" --project="${GCP_PROJECT_ID}" --format='value(name)' | grep -qx "${DB_USER}"; then
  gcloud sql users create "${DB_USER}" \
    --instance="${DB_INSTANCE}" \
    --project="${GCP_PROJECT_ID}" \
    --password="${DB_PASS}"
else
  echo "Updating password for existing user ${DB_USER}"
  gcloud sql users set-password "${DB_USER}" \
    --instance="${DB_INSTANCE}" \
    --project="${GCP_PROJECT_ID}" \
    --password="${DB_PASS}"
fi

ENC_USER="$(U="${DB_USER}" python3 -c 'import os,urllib.parse; print(urllib.parse.quote(os.environ["U"], safe=""))')"
ENC_PASS="$(P="${DB_PASS}" python3 -c 'import os,urllib.parse; print(urllib.parse.quote(os.environ["P"], safe=""))')"
SOCKET_URL="postgresql://${ENC_USER}:${ENC_PASS}@localhost/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"
PROXY_URL="postgresql://${ENC_USER}:${ENC_PASS}@127.0.0.1:5433/${DB_NAME}"

upsert_secret() {
  local name="$1"
  local value="$2"
  if gcloud secrets describe "${name}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1; then
    printf '%s' "${value}" | gcloud secrets versions add "${name}" --data-file=- --project="${GCP_PROJECT_ID}"
  else
    printf '%s' "${value}" | gcloud secrets create "${name}" --data-file=- --project="${GCP_PROJECT_ID}" --replication-policy=automatic
  fi
}

echo "Storing secrets..."
upsert_secret "${GCP_DATABASE_URL_SECRET_NAME}" "${SOCKET_URL}"
upsert_secret "${GCP_DATABASE_URL_SECRET_NAME}-proxy" "${PROXY_URL}"
JWT_SECRET="$(openssl rand -base64 48)"
JWT_REFRESH="$(openssl rand -base64 48)"
upsert_secret "${GCP_JWT_SECRET_NAME}" "${JWT_SECRET}"
upsert_secret "${GCP_JWT_REFRESH_SECRET_NAME}" "${JWT_REFRESH}"

PROJECT_NUMBER="$(gcloud projects describe "${GCP_PROJECT_ID}" --format='value(projectNumber)')"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
for ROLE in \
  roles/cloudsql.client \
  roles/secretmanager.secretAccessor \
  roles/storage.objectAdmin \
  roles/cloudbuild.builds.builder \
  roles/logging.logWriter \
  roles/artifactregistry.writer
do
  gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="${ROLE}" \
    --quiet >/dev/null
done
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/storage.admin" \
  --quiet >/dev/null || true

echo "Cloud SQL and secrets are ready."
echo "  Instance: ${CONNECTION_NAME}"
echo "  Database: ${DB_NAME}"
echo "  User:     ${DB_USER}"
echo ""
echo "Next: deploy the API, attach secrets, then migrate:"
echo "  cd ${BACKEND} && npm run deploy:dev"
echo "  gcloud run services update ${SERVICE_NAME} --region ${GCP_REGION} --project ${GCP_PROJECT_ID} \\"
echo "    --set-secrets=DATABASE_URL=${GCP_DATABASE_URL_SECRET_NAME}:latest,JWT_SECRET=${GCP_JWT_SECRET_NAME}:latest,JWT_REFRESH_SECRET=${GCP_JWT_REFRESH_SECRET_NAME}:latest"
echo "  # Terminal 1: ./scripts/start-cloud-sql-proxy.sh"
echo "  # Terminal 2:"
echo "  DATABASE_URL='${PROXY_URL}' npm run prisma:deploy"
