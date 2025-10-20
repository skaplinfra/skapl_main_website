# 🚀 DEPLOY NOW - Quick Commands

## ⚡ FASTEST PATH - Just Run These!

### 1️⃣ Install Dependencies
```bash
cd functions
npm install
cd ..
```

### 2️⃣ Set GitHub Secrets (ONE TIME)

Go to: **https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions**

Add these secrets:

| Secret Name | Value | Where to Get It |
|------------|-------|----------------|
| `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD` | Service account JSON | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_TOKEN` | Token string | Run: `firebase login:ci` |
| `PROD_TURNSTILE_CONTACT_SECRET_KEY` | Contact secret | Cloudflare Turnstile Dashboard |
| `PROD_TURNSTILE_CAREER_SECRET_KEY` | Career secret | Cloudflare Turnstile Dashboard |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project Settings |
| `SUPABASE_SERVICE_KEY` | Service role key | Supabase Project Settings → API |
| `GOOGLE_SHEET_ID` | `1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg` | Your contact sheet URL |
| `GOOGLE_SHEET_ID_CRP` | `1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec` | Your career sheet URL |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Single-line JSON | See below ⬇️ |

#### Get GOOGLE_SERVICE_ACCOUNT_KEY:
```powershell
# Windows PowerShell - Run in your project directory
$jsonContent = Get-Content gs_key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
Write-Output $jsonContent
# Copy the output and paste as secret
```

### 3️⃣ Enable Google Cloud APIs (ONE TIME)
```bash
gcloud services enable cloudfunctions.googleapis.com --project=skapl-prod
gcloud services enable cloudbuild.googleapis.com --project=skapl-prod
gcloud services enable run.googleapis.com --project=skapl-prod
gcloud services enable sheets.googleapis.com --project=skapl-prod
```

### 4️⃣ Share Google Sheets (ONE TIME)

1. Open both sheets:
   - Contact: https://docs.google.com/spreadsheets/d/1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg
   - Career: https://docs.google.com/spreadsheets/d/1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec

2. Click Share → Add your service account email (from gs_key.json: `client_email`)

3. Give **Editor** permissions

### 5️⃣ DEPLOY!
```bash
git add .
git commit -m "fix: migrate to Gen2 functions with Google Sheets"
git push origin main
```

✅ **GitHub Actions will automatically deploy!**

---

## 🧪 Test Locally First (Recommended)

### Setup Local Environment
```bash
cd functions
cp .env.example .env
# Edit .env with your actual values (see .env.example for template)
```

### Run Local Dev Server
```bash
npm run dev
```

### Test Functions Locally
```bash
firebase emulators:start
```

---

## 🔧 Manual Deployment (If GitHub Actions Fails)

### Option 1: Deploy Everything
```bash
npm run build
firebase deploy
```

### Option 2: Deploy Only Functions
```bash
firebase deploy --only functions --force
```

### Option 3: Deploy Only Hosting
```bash
npm run build
firebase deploy --only hosting:production
```

---

## 🆘 Emergency Fixes

### If Functions Won't Deploy
```bash
# Delete old functions
firebase functions:delete mediumPosts --force
firebase functions:delete verifyTurnstile --force
firebase functions:delete submitContactForm --force
firebase functions:delete submitCareerForm --force

# Redeploy
firebase deploy --only functions --force
```

### If Getting IAM Errors
```bash
# Get your service account email from gs_key.json
$email = (Get-Content gs_key.json | ConvertFrom-Json).client_email
Write-Output $email

# Grant necessary permissions
gcloud projects add-iam-policy-binding skapl-prod --member="serviceAccount:$email" --role="roles/editor"
```

### If Google Sheets Not Working
```bash
# Verify service account has access
# 1. Check the email in gs_key.json (client_email field)
# 2. Go to Google Sheets and verify that email has Editor access
# 3. Check Firebase Functions logs:
firebase functions:log
```

---

## 📊 Verify Deployment

After deployment, check:

1. **Firebase Console**: https://console.firebase.google.com/project/skapl-prod/functions
   - Should see 4 functions: mediumPosts, verifyTurnstile, submitContactForm, submitCareerForm

2. **Your Website**: https://your-domain.com
   - Test contact form
   - Test career form

3. **Google Sheets**: Should receive data from form submissions

4. **Supabase**: Check tables for saved data

5. **Firebase Logs**:
```bash
firebase functions:log --limit 50
```

---

## 🎯 What Changed (Summary)

✅ **Fixed Gen 1 → Gen 2 Migration**
- Changed from `functions.https.onRequest` to `onRequest` from `firebase-functions/v2/https`
- Updated `firebase.json` to specify Node 20 runtime

✅ **Fixed Environment Variables**
- Added `.env` file support in Cloud Functions
- GitHub Actions now creates `.env` before deployment
- All secrets properly passed to functions

✅ **Fixed Google Sheets**
- Added `googleapis` package
- Created `googleSheets.js` helper
- Integrated with contact & career forms
- Non-blocking (won't break forms if Sheets fails)

✅ **Fixed IAM & Deployment**
- Proper service account configuration
- Environment variables loaded via `dotenv`
- Force flag on deployment to override Gen 1 functions

---

## 🎉 Expected Result

After running these commands:

1. ✅ TypeScript builds successfully
2. ✅ Firebase Functions deploy to Gen 2
3. ✅ Environment variables work in production
4. ✅ Forms save to Supabase
5. ✅ Forms save to Google Sheets
6. ✅ Turnstile verification works
7. ✅ No IAM errors
8. ✅ GitHub Actions deploys automatically on push to main

---

## 📞 Still Broken?

Check the logs:
```bash
firebase functions:log --limit 100
```

Or run locally to debug:
```bash
firebase emulators:start --inspect-functions
```

Everything should work now! 🚀

