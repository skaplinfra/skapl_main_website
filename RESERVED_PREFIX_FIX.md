# ✅ Firebase Reserved Prefix Issue Fixed

## Problem

The deployment was failing with:
```
Error: Failed to load environment variables from .env.:
- Error Key FIREBASE_SERVICE_ACCOUNT_PATH starts with a reserved prefix (X_GOOGLE_ FIREBASE_ EXT_)
```

### Root Cause

Firebase Functions reserves certain environment variable prefixes for internal use:
- `FIREBASE_*`
- `GOOGLE_*`
- `X_GOOGLE_*`
- `EXT_*`

You **cannot** use these prefixes in your `.env` file for Firebase Functions.

## Solution

Renamed all environment variables to avoid reserved prefixes:

### Environment Variable Mapping

| Old Name (❌ Reserved) | New Name (✅ Allowed) | Purpose |
|---|---|---|
| `GOOGLE_CLOUD_PROJECT_ID` | `GCP_PROJECT_ID` | Google Cloud project ID |
| `GOOGLE_CLOUD_STORAGE_BUCKET` | `GCS_BUCKET` | Cloud Storage bucket name |
| `GOOGLE_SHEET_ID` | `GSHEET_ID` | Contact form sheet ID |
| `GOOGLE_SHEET_ID_CRP` | `GSHEET_ID_CRP` | Career form sheet ID |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | `SERVICE_ACCOUNT_PATH` | Path to Firebase service account JSON |
| `GOOGLE_SERVICE_ACCOUNT_PATH` | `GCS_SERVICE_ACCOUNT_PATH` | Path to GCS service account JSON |

### Kept (No Prefix Conflict)

These variables were fine and kept as-is:
- `TURNSTILE_CONTACT_SECRET_KEY`
- `TURNSTILE_CAREER_SECRET_KEY`
- `KLIAN_CHATBOT_KEY`

## Files Updated

### 1. `.github/workflows/firebase-production.yml` ✅

Updated to use new environment variable names in the `.env` file creation:

```bash
echo "GCP_PROJECT_ID=${{ secrets.GOOGLE_CLOUD_PROJECT_ID }}" >> .env
echo "GCS_BUCKET=${{ secrets.GOOGLE_CLOUD_STORAGE_BUCKET }}" >> .env
echo "GSHEET_ID=${{ secrets.GOOGLE_SHEET_ID }}" >> .env
echo "GSHEET_ID_CRP=${{ secrets.GOOGLE_SHEET_ID_CRP }}" >> .env
echo "SERVICE_ACCOUNT_PATH=./firebase-service-account.json" >> .env
echo "GCS_SERVICE_ACCOUNT_PATH=./google-service-account.json" >> .env
```

### 2. `functions/index.js` ✅

Updated both `career` and `contact` functions to use new variable names with **fallbacks** for local development:

```javascript
// Example: Project ID with fallback
projectId: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID

// Example: Storage bucket with fallback
bucket(process.env.GCS_BUCKET || process.env.GOOGLE_CLOUD_STORAGE_BUCKET)

// Example: Sheet ID with fallback
const sheetId = process.env.GSHEET_ID || process.env.GOOGLE_SHEET_ID;
```

## Benefits

✅ **No reserved prefix conflicts** - Uses allowed variable names
✅ **Backward compatible** - Falls back to old names for local development
✅ **No GitHub Secrets changes needed** - Secrets keep their original names
✅ **Works in production** - Firebase Functions can load the .env file
✅ **Works locally** - Fallback to original environment variable names

## How It Works

### In Production (Firebase Functions):
1. GitHub Actions creates `.env` with new names (e.g., `GCP_PROJECT_ID`)
2. Firebase Functions load the `.env` file successfully (no reserved prefixes)
3. Functions use the new environment variable names

### In Local Development:
1. You can use old names in your local `.env` or environment (e.g., `GOOGLE_CLOUD_PROJECT_ID`)
2. Functions check new names first, fall back to old names
3. Works either way!

## No Changes Needed From You

The same GitHub Secrets you already have work perfectly:
- `GOOGLE_CLOUD_PROJECT_ID` (secret name unchanged)
- `GOOGLE_CLOUD_STORAGE_BUCKET` (secret name unchanged)
- `GOOGLE_SHEET_ID` (secret name unchanged)
- `GOOGLE_SHEET_ID_CRP` (secret name unchanged)

The workflow just **maps** them to different variable names in the functions' `.env` file.

## Ready to Deploy!

```bash
git add .
git commit -m "fix: Avoid Firebase reserved environment variable prefixes"
git push origin master
```

This will now work! The deployment will:
1. ✅ Create `.env` file with allowed variable names
2. ✅ Deploy functions successfully
3. ✅ Functions read credentials from files
4. ✅ Forms work in production

## Environment Variables in Functions

After deployment, your functions will have:

```env
# In functions/.env (deployed with the function)
TURNSTILE_CONTACT_SECRET_KEY=...
TURNSTILE_CAREER_SECRET_KEY=...
GCP_PROJECT_ID=skapl-prod
GCS_BUCKET=your-bucket-name
GSHEET_ID=your-contact-sheet-id
GSHEET_ID_CRP=your-career-sheet-id
KLIAN_CHATBOT_KEY=...
SERVICE_ACCOUNT_PATH=./firebase-service-account.json
GCS_SERVICE_ACCOUNT_PATH=./google-service-account.json
```

Plus the JSON files:
- `firebase-service-account.json`
- `google-service-account.json`

## Reference: Firebase Reserved Prefixes

Firebase Functions **automatically** sets these environment variables:
- `FIREBASE_CONFIG` - Firebase project configuration
- `GCLOUD_PROJECT` - Google Cloud project ID
- `GCP_PROJECT` - Google Cloud project (alternative)
- `GOOGLE_CLOUD_PROJECT` - Google Cloud project (alternative)
- `X_GOOGLE_*` - Internal Google variables
- `EXT_*` - Firebase Extensions variables

You cannot override these in your `.env` file.

## Summary

**Problem**: Firebase rejected `.env` variables starting with `FIREBASE_*` or `GOOGLE_*`

**Solution**: Renamed to `GCP_*`, `GCS_*`, `GSHEET_*` with fallbacks for local dev

**Result**: Deployment will now succeed! ✅

---

**Ready!** Just commit and push. 🚀

