#!/bin/bash

# Configuration
PROJECT_ID="skapl-prod"
SERVICE_NAME="forms-api"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying to Cloud Run..."

# Build and push image
echo "📦 Building Docker image..."
gcloud builds submit --tag ${IMAGE_NAME} --project ${PROJECT_ID}

# Deploy to Cloud Run
echo "🌐 Deploying service..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars "GCS_BUCKET=${GCS_BUCKET},GSHEET_ID=${GSHEET_ID},GSHEET_ID_CRP=${GSHEET_ID_CRP},TURNSTILE_CONTACT_SECRET_KEY=${TURNSTILE_CONTACT_SECRET_KEY},TURNSTILE_CAREER_SECRET_KEY=${TURNSTILE_CAREER_SECRET_KEY},GOOGLE_SERVICE_ACCOUNT_KEY=${GOOGLE_SERVICE_ACCOUNT_KEY}" \
  --project ${PROJECT_ID}

echo "✅ Deployment complete!"
echo "🔗 Service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --project ${PROJECT_ID} --format="value(status.url)"

