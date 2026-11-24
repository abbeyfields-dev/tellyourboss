#!/usr/bin/env bash
# Boss-Rater GCP defaults. Override with env vars.

export GCP_ACCOUNT="${GCP_ACCOUNT:-founders@navayro.com}"
export GCP_PROJECT_ID="${GCP_PROJECT_ID:-bossorater}"
export GCP_REGION="${GCP_REGION:-us-central1}"

export SERVICE_NAME="${SERVICE_NAME:-bossorater-api}"

export DB_INSTANCE="${DB_INSTANCE:-bossorater-db}"
export DB_NAME="${DB_NAME:-bossorater}"
export DB_USER="${DB_USER:-bossorater_user}"
export DB_TIER="${DB_TIER:-db-f1-micro}"
export DB_VERSION="${DB_VERSION:-POSTGRES_15}"

export AR_REPO="${AR_REPO:-bossorater}"
export IMAGE_NAME="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/${AR_REPO}/${SERVICE_NAME}:latest"

export CONNECTION_NAME="${GCP_PROJECT_ID}:${GCP_REGION}:${DB_INSTANCE}"
export GCP_DATABASE_URL_SECRET_NAME="${GCP_DATABASE_URL_SECRET_NAME:-bossorater-database-url}"
export GCP_JWT_SECRET_NAME="${GCP_JWT_SECRET_NAME:-bossorater-jwt-secret}"
export GCP_JWT_REFRESH_SECRET_NAME="${GCP_JWT_REFRESH_SECRET_NAME:-bossorater-jwt-refresh-secret}"
export SOURCE_PROJECT_ID="${SOURCE_PROJECT_ID:-navayro}"
