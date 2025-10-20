# GitHub Secrets Required

Make sure these secrets are set in your GitHub repository:

## Required Secrets

### Firebase
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Firebase service account JSON
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Google Cloud
- `GOOGLE_SERVICE_ACCOUNT_KEY` - GCP service account with:
  - Storage Admin (for GCS uploads)
  - Cloud Run Admin (for deployment)
  - Cloud Build Editor (for image builds)

### Application
- `GOOGLE_CLOUD_STORAGE_BUCKET` - Your GCS bucket name (e.g., `skapl-resumes`)
- `GOOGLE_SHEET_ID` - Contact form sheet ID
- `GOOGLE_SHEET_ID_CRP` - Career form sheet ID
- `TURNSTILE_CONTACT_SECRET_KEY` - Cloudflare Turnstile secret for contact form
- `TURNSTILE_CAREER_SECRET_KEY` - Cloudflare Turnstile secret for career form
- `NEXT_PUBLIC_TURNSTILE_CONTACT_SITE_KEY` - Turnstile site key (public)
- `NEXT_PUBLIC_TURNSTILE_CAREER_SITE_KEY` - Turnstile site key (public)

## How to Add Secrets

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click "New repository secret"
3. Add each secret one by one

