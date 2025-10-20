# Forms API - Cloud Run Deployment

FastAPI application for handling contact and career forms, deployed on Google Cloud Run.

## 🚀 Quick Deploy

```bash
# 1. Set environment variables
export GCS_BUCKET="your-bucket"
export GSHEET_ID="your-sheet-id"
export GSHEET_ID_CRP="your-career-sheet-id"
export TURNSTILE_CONTACT_SECRET_KEY="your-secret"
export TURNSTILE_CAREER_SECRET_KEY="your-secret"
export GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# 2. Deploy
chmod +x deploy.sh
./deploy.sh
```

## 📋 Endpoints

- `POST /api/contact` - Contact form submission
- `POST /api/career` - Career application with resume upload
- `GET /health` - Health check

## 🔧 Update Firebase Hosting Rewrites

After deployment, update `firebase.json`:

```json
"rewrites": [
  {
    "source": "/api/**",
    "run": {
      "serviceId": "forms-api",
      "region": "us-central1"
    }
  }
]
```

## ✅ Benefits Over Cloud Functions

- ✅ Easier to make public (`--allow-unauthenticated`)
- ✅ No Gen1/Gen2 confusion
- ✅ Better performance
- ✅ More control
- ✅ Bypasses Cloud Functions org policies

