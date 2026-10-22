#!/usr/bin/env bash
# One-command deploy to Google Cloud: Cloud Run + Cloud SQL (Postgres) + Secret Manager.
# Run from the repo root, ideally in Google Cloud Shell:  PROJECT=your-project-id bash deploy/gcp.sh
set -euo pipefail
: "${PROJECT:?Set PROJECT=your-gcp-project-id}"
REGION=${REGION:-us-central1}
SQL=tasklane-db; DB=tasklane; DB_USER=tasklane

gcloud config set project "$PROJECT"
gcloud services enable run.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com

if ! gcloud sql instances describe "$SQL" >/dev/null 2>&1; then # first run only
  PASS=$(openssl rand -hex 16)
  gcloud sql instances create "$SQL" --database-version=POSTGRES_16 --edition=ENTERPRISE --tier=db-f1-micro --region="$REGION"
  gcloud sql databases create "$DB" --instance="$SQL"
  gcloud sql users create "$DB_USER" --instance="$SQL" --password="$PASS"
  printf 'postgres://%s:%s@/%s?host=/cloudsql/%s:%s:%s' "$DB_USER" "$PASS" "$DB" "$PROJECT" "$REGION" "$SQL" | gcloud secrets create database-url --data-file=-
  openssl rand -hex 32 | tr -d '\n' | gcloud secrets create session-secret --data-file=-
  SA="$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
  for ROLE in secretmanager.secretAccessor cloudsql.client; do
    gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA" --role="roles/$ROLE" --condition=None >/dev/null
  done
fi

gcloud run deploy tasklane --source . --region "$REGION" --allow-unauthenticated \
  --add-cloudsql-instances "$PROJECT:$REGION:$SQL" \
  --set-secrets DATABASE_URL=database-url:latest,SESSION_SECRET=session-secret:latest \
  --set-env-vars NODE_ENV=production
