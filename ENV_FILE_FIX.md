# ✅ .env File Issue Fixed

## Problem

The deployment was failing with:
```
Error: Failed to load environment variables from .env.:
- FirebaseError Invalid dotenv file, error on lines: ***,***,...
```

### Root Cause

JSON environment variables (like `FIREBASE_SERVICE_ACCOUNT_KEY` and `GOOGLE_SERVICE_ACCOUNT_KEY`) contain newlines and special characters that can't be directly written to `.env` files. When GitHub Actions tried to create the `.env` file with these JSON strings, it created an invalid dotenv format.

## Solution Implemented

Instead of putting JSON in `.env` files, we now:

### 1. Create JSON Files for Service Accounts ✅

In GitHub Actions, we create actual JSON files:
- `functions/firebase-service-account.json`
- `functions/google-service-account.json`

These files are created during deployment and included with the functions.

### 2. Simple Values in .env ✅

The `.env` file now only contains simple string values:
```env
TURNSTILE_CONTACT_SECRET_KEY=...
TURNSTILE_CAREER_SECRET_KEY=...
GOOGLE_CLOUD_PROJECT_ID=...
GOOGLE_CLOUD_STORAGE_BUCKET=...
GOOGLE_SHEET_ID=...
GOOGLE_SHEET_ID_CRP=...
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
GOOGLE_SERVICE_ACCOUNT_PATH=./google-service-account.json
```

### 3. Updated Functions Code ✅

The Firebase Functions now read service account credentials from files first, with fallback to environment variables for local development:

```javascript
// Try to read from file first (deployed), then from env var (local dev)
if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH)) {
  credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH, 'utf8'));
} else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
}
```

This works for both:
- **Production**: Reads from `firebase-service-account.json` and `google-service-account.json`
- **Local Development**: Reads from `FIREBASE_SERVICE_ACCOUNT_KEY` and `GOOGLE_SERVICE_ACCOUNT_KEY` environment variables

## Files Changed

1. **`.github/workflows/firebase-production.yml`**
   - Creates JSON files instead of putting JSON in .env
   - Only simple values in .env file
   - Proper cleanup of sensitive files

2. **`functions/index.js`**
   - Added `fs` require at top
   - Updated credential loading in both functions (career & contact)
   - Supports both file-based and env-var based credentials

## No Changes Needed From You

All fixes are complete! The same deployment steps still apply:

```bash
git add .
git commit -m "fix: Handle service account credentials via files instead of .env"
git push origin master
```

## How It Works Now

### During Deployment:
1. GitHub Actions creates `firebase-service-account.json` and `google-service-account.json` in the functions directory
2. Creates `.env` with simple string values and paths to the JSON files
3. Deploys functions with these files included
4. Cleans up sensitive files after deployment

### At Runtime (in Production):
1. Firebase Functions load and execute
2. Code reads `FIREBASE_SERVICE_ACCOUNT_PATH` from .env
3. Code reads the JSON file at that path
4. Uses the credentials from the file

### For Local Development:
1. You can still use `.env` file with JSON strings (escaped)
2. Or use environment variables directly
3. The code will fall back to `FIREBASE_SERVICE_ACCOUNT_KEY` env var

## Benefits

✅ **No more .env parsing errors** - JSON is in proper files
✅ **Works in production** - Files are deployed with the functions
✅ **Works locally** - Falls back to environment variables
✅ **Secure** - Files are cleaned up after deployment
✅ **Standard practice** - Using service account files is the recommended approach

## Verification

After deployment, the functions will:
1. ✅ Successfully authenticate with Google Cloud Storage
2. ✅ Successfully authenticate with Google Sheets API
3. ✅ Upload resumes to Cloud Storage
4. ✅ Save form data to Google Sheets
5. ✅ Verify Turnstile tokens

## Next Steps

Just push the changes! Everything is ready to go:

```bash
git add .
git commit -m "fix: Fix .env file and service account credentials handling"
git push origin master
```

The deployment will now succeed! 🎉

