#!/bin/bash

# Cloud Run Deployment Script for Tomago Staging
set -e

PROJECT_ID="tomago-staging"
SERVICE_NAME="tomago-staging"
REGION="europe-west3"

echo "Starting Cloud Run deployment: ${SERVICE_NAME} -> ${PROJECT_ID} (${REGION})"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI is not installed"
  exit 1
fi

gcloud config set project "$PROJECT_ID"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Use ^|^ delimiter so values with commas/spaces/special chars are safe
gcloud run deploy "$SERVICE_NAME" \
  --source . \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --quiet \
  --set-env-vars "^|^NODE_ENV=staging|ENV=staging|WALLET_BALANCE_KEY=JaQqWoh88onGaq+m5AfUu9TtddQULIYz|MYLERZ_USERNAME=Decoopa|MYLERZ_PASSWORD=CVBIUfWj8YG\$1a|EMAIL_PROVIDER=nodemailer|EMAIL_SMTP_HOST=smtp.gmail.com|EMAIL_SMTP_PORT=465|EMAIL_SECURE=true|EMAIL_FROM=Tomago <mohamedelnemr.runprof@gmail.com>|EMAIL_USER=mohamedelnemr.runprof@gmail.com|EMAIL_PASSWORD=rwkm vuqx plce wppq|DYNALINKS_API_KEY=6gw1mfNBDx4Fs7QyXe4tJnLQ|DYNALINKS_API_URL=https://dynalinks.app/api/v1/links|DYNALINKS_SUBDOMAIN=tomago|VERIFY_EMAIL_BASE_URL=https://tomago-staging-7125900076.europe-west3.run.app" \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 5 \
  --timeout 300 \
  --concurrency 80 \
  --execution-environment gen2 \
  --port 8080

SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)")
echo "Service URL: $SERVICE_URL"
echo "Health: $SERVICE_URL/health"
curl -sf "$SERVICE_URL/health" && echo "" || echo "Health check pending/failed"
