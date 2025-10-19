# 🚀 Ready to Commit and Deploy

## What Was Fixed

✅ **Response cloning bug** - Fixed in `lib/clientApi.ts`
✅ **Package dependencies** - Updated `functions/package.json` and regenerated `package-lock.json`
✅ **Firebase Functions created** - New `functions/index.js` with career and contact endpoints
✅ **GitHub Actions workflow** - Updated to deploy functions with correct environment variables
✅ **Firebase config** - Updated `firebase.json` with API route rewrites

## Files Changed (Ready to Commit)

```
Modified:
- lib/clientApi.ts
- functions/package.json
- functions/package-lock.json (regenerated)
- firebase.json
- .github/workflows/firebase-production.yml

New:
- functions/index.js
- functions/README.md
- DEPLOYMENT_FIX.md
- QUICK_FIX_SUMMARY.md
- COMMIT_AND_PUSH.md (this file)
```

## Prerequisites

### Add FIREBASE_TOKEN Secret (if not already added)

The workflow needs a `FIREBASE_TOKEN` to deploy functions. Get it by running:

```bash
firebase login:ci
```

This will generate a token. Add it to your GitHub repository:
1. Go to: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `FIREBASE_TOKEN`
4. Value: (paste the token from the command above)

**OR** if you prefer to use service account authentication, update the workflow to use:
```yaml
- name: Deploy Functions to Firebase
  run: |
    export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/gs_key.json"
    firebase deploy --only functions --force --project skapl-prod --non-interactive
```

## Commit and Push

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "fix: Fix production API routes and deploy Firebase Functions

- Fix response cloning bug in clientApi.ts
- Create Firebase Functions for career and contact forms
- Update GitHub Actions workflow to deploy functions
- Add environment variables to functions deployment
- Update firebase.json with API route rewrites

Fixes: Career form submission returning HTML instead of JSON
Fixes: Response body already used error
"

# Push to master (will trigger automatic deployment)
git push origin master
```

## What Happens After Push

1. **GitHub Actions triggers** - The workflow starts automatically
2. **Installs dependencies** - Both root and functions dependencies
3. **Builds Next.js** - Static export to `out/` directory
4. **Deploys Functions** - career and contact endpoints to asia-south1
5. **Deploys Hosting** - Static site to Firebase Hosting
6. **Tests** - Forms should now work!

## Verification After Deployment

### Check Deployment Status
```bash
# View GitHub Actions logs
# Go to: https://github.com/YOUR_USERNAME/skapl_main_website/actions

# Or check Firebase console
# Go to: https://console.firebase.google.com/project/skapl-prod
```

### Test the Forms

1. **Career Form**: https://skapl-prod.web.app/careers
   - Fill out the form
   - Upload a PDF resume (< 5MB)
   - Click Submit
   - Should see: "Application submitted successfully"

2. **Contact Form**: https://skapl-prod.web.app/contact
   - Fill out the form
   - Click Submit
   - Should see: "Contact form submitted successfully"

### Check Logs
```bash
# View function logs
firebase functions:log --project skapl-prod

# Or in Firebase Console:
# Functions → Logs
```

### Verify Data Storage

1. **Google Sheets** - Check for new entries:
   - Career applications: Sheet with ID from `GOOGLE_SHEET_ID_CRP`
   - Contact forms: Sheet with ID from `GOOGLE_SHEET_ID`

2. **Google Cloud Storage** - Check for uploaded resumes:
   - Bucket: Value from `GOOGLE_CLOUD_STORAGE_BUCKET`
   - Path: `resumes/`

## Troubleshooting

### If Deployment Fails

**Error: "Missing FIREBASE_TOKEN"**
- Solution: Add the FIREBASE_TOKEN secret (see Prerequisites above)

**Error: "Failed to deploy functions"**
- Check that all environment variables are set in GitHub Secrets
- Verify service account has necessary permissions

**Error: "npm ci failed"**
- Solution: Already fixed! The package-lock.json is now in sync

**Error: "Turnstile verification failed"**
- Verify `TURNSTILE_CAREER_SECRET_KEY` and `TURNSTILE_CONTACT_SECRET_KEY` are correct

### If Forms Still Return HTML

This means the functions didn't deploy. Check:
```bash
# List deployed functions
firebase functions:list --project skapl-prod

# Should show:
# career(us-central1 or asia-south1)
# contact(us-central1 or asia-south1)
```

If functions are missing, manually deploy:
```bash
firebase deploy --only functions --project skapl-prod
```

## Quick Reference: All Required GitHub Secrets

Make sure these are all set in GitHub Actions secrets:

- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON)
- ✅ `FIREBASE_TOKEN` (get from `firebase login:ci`) - **NEW REQUIREMENT**
- ✅ `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON)
- ✅ `GOOGLE_CLOUD_PROJECT_ID`
- ✅ `GOOGLE_CLOUD_STORAGE_BUCKET`
- ✅ `GOOGLE_SHEET_ID`
- ✅ `GOOGLE_SHEET_ID_CRP`
- ✅ `TURNSTILE_CONTACT_SECRET_KEY`
- ✅ `TURNSTILE_CAREER_SECRET_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- ✅ `NEXT_PUBLIC_TURNSTILE_CONTACT_SITE_KEY`
- ✅ `NEXT_PUBLIC_TURNSTILE_CAREER_SITE_KEY`

## Success Indicators

✅ GitHub Actions workflow completes successfully
✅ No errors in Firebase Functions logs
✅ Career form submits successfully
✅ Contact form submits successfully
✅ Data appears in Google Sheets
✅ Resumes appear in Cloud Storage
✅ No more "invalid JSON" errors in browser console

---

**Ready to deploy!** Just commit and push to master branch. 🚀

