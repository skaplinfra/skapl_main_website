# Firebase Deployment Fix Guide

## What Was Fixed

### 1. **Gen 2 Cloud Functions Migration** ✅
- Migrated from Gen 1 (`functions.https.onRequest`) to Gen 2 (`onRequest` from `firebase-functions/v2/https`)
- This fixes compatibility issues with `firebase-functions` v6+

### 2. **Environment Variables** ✅
- Added proper `.env` file support for functions
- GitHub Actions now creates `.env` file with secrets before deployment
- Added `dotenv` loading in functions code

### 3. **Firebase Configuration** ✅
- Updated `firebase.json` to specify Node.js 20 runtime
- Proper functions configuration with codebase

### 4. **IAM Permissions** ✅
- Functions will now use service account properly
- Environment variables passed correctly during deployment

---

## 🚀 Deployment Commands

### **First Time Setup**

1. **Install Firebase CLI** (if not already installed):
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**:
```bash
firebase login
```

3. **Set your project**:
```bash
firebase use skapl-prod
```

4. **Set Environment Variables for Functions** (Important!):
```bash
firebase functions:secrets:set TURNSTILE_CONTACT_SECRET
firebase functions:secrets:set TURNSTILE_CAREER_SECRET
firebase functions:secrets:set SUPABASE_URL
firebase functions:secrets:set SUPABASE_SERVICE_KEY
```

### **Manual Deployment**

To deploy everything:
```bash
npm run build
firebase deploy
```

To deploy only functions:
```bash
firebase deploy --only functions
```

To deploy only hosting:
```bash
firebase deploy --only hosting:production
```

### **Local Testing**

1. **Create local .env file in functions folder**:
```bash
cd functions
cp .env.example .env
# Edit .env with your actual values
```

2. **Test functions locally**:
```bash
firebase emulators:start
```

3. **Test the Next.js app locally**:
```bash
npm run dev
```

---

## 🔧 Troubleshooting

### If functions fail to deploy:

1. **Check IAM permissions**:
```bash
gcloud projects add-iam-policy-binding skapl-prod \
  --member="serviceAccount:YOUR_SERVICE_ACCOUNT@skapl-prod.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"
```

2. **Delete old Gen 1 functions** (if they exist):
```bash
firebase functions:delete mediumPosts --force
firebase functions:delete verifyTurnstile --force
firebase functions:delete submitContactForm --force
firebase functions:delete submitCareerForm --force
```

3. **Redeploy with force flag**:
```bash
firebase deploy --only functions --force
```

### If you get "Missing permissions" error:

Enable required APIs:
```bash
gcloud services enable cloudfunctions.googleapis.com --project=skapl-prod
gcloud services enable cloudbuild.googleapis.com --project=skapl-prod
gcloud services enable cloudscheduler.googleapis.com --project=skapl-prod
gcloud services enable run.googleapis.com --project=skapl-prod
```

---

## 📋 GitHub Secrets Required

Make sure these secrets are set in your GitHub repository:
- `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD`
- `FIREBASE_TOKEN`
- `PROD_TURNSTILE_CONTACT_SECRET_KEY`
- `PROD_TURNSTILE_CAREER_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

---

## ✅ What Works Now

- ✅ TypeScript compilation (Next.js build works)
- ✅ Firebase Cloud Functions Gen 2
- ✅ Environment variables properly loaded
- ✅ IAM permissions configured
- ✅ CORS handling
- ✅ Static export with API routes via Cloud Functions
- ✅ Automated GitHub Actions deployment

---

## 🎯 Quick Deploy Command

If everything is set up:
```bash
git add .
git commit -m "fix: migrate to Firebase Gen 2 functions with proper IAM"
git push origin main
```

The GitHub Action will automatically deploy!

