# 🔧 Production Bug Fix Guide

## Problem Summary

Your production site was failing with these errors:
1. **JSON Parse Error**: API routes returning HTML instead of JSON
2. **Response Clone Error**: Response body was being consumed before cloning
3. **Turnstile 401 Errors**: Cloudflare Turnstile challenges failing

## Root Cause

The Next.js site is configured as a **static export** (`output: 'export'`), which means:
- API routes in `app/api/` don't work in production (they need a server)
- When forms try to call `/api/career` or `/api/contact`, they get the 404 HTML page
- This HTML response can't be parsed as JSON, causing the error

## Solution Implemented

### 1. Fixed Response Cloning Bug ✅
**File**: `lib/clientApi.ts`

Fixed the error where response was consumed before cloning, which caused:
```
Failed to execute 'clone' on 'Response': Response body is already used
```

### 2. Created Firebase Functions ✅
**File**: `functions/index.js`

Created two Firebase Functions to replace the Next.js API routes:
- `career` - Handles job applications with resume uploads
- `contact` - Handles contact form submissions

### 3. Updated Firebase Configuration ✅
**File**: `firebase.json`

Added rewrites to route API calls to Firebase Functions:
```json
{
  "source": "/api/career",
  "function": "career"
},
{
  "source": "/api/contact",
  "function": "contact"
}
```

## Deployment Steps

### Step 1: Install Function Dependencies

```bash
cd functions
npm install
```

This will install the required packages:
- `@google-cloud/storage` - For resume uploads
- `formidable` - For parsing form data
- `googleapis` - For Google Sheets integration

### Step 2: Set Environment Variables in Firebase

You need to set the following environment variables for the Firebase Functions. You can do this in the Firebase Console or using the Firebase CLI.

**Option A: Using Firebase Console**
1. Go to Firebase Console → Functions → Configuration
2. Add each environment variable

**Option B: Using .env file (Recommended for Functions v2)**

Create `functions/.env` file with:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
GOOGLE_SHEET_ID=your-contact-sheet-id
GOOGLE_SHEET_ID_CRP=your-career-sheet-id
TURNSTILE_CONTACT_SECRET_KEY=0x4AAAAAAA...
TURNSTILE_CAREER_SECRET_KEY=0x4AAAAAAA...
```

**You already have these values** - they were shown in your message:
- ✅ FIREBASE_SERVICE_ACCOUNT_KEY
- ✅ GOOGLE_CLOUD_PROJECT_ID
- ✅ GOOGLE_CLOUD_STORAGE_BUCKET
- ✅ GOOGLE_SERVICE_ACCOUNT_KEY
- ✅ GOOGLE_SHEET_ID
- ✅ GOOGLE_SHEET_ID_CRP
- ✅ TURNSTILE_CAREER_SECRET_KEY
- ✅ TURNSTILE_CONTACT_SECRET_KEY

Just copy them from your deployment platform (Vercel/etc) to the `.env` file in the functions directory.

### Step 3: Deploy Functions

```bash
# From the root directory
firebase deploy --only functions
```

Or deploy individually:
```bash
firebase deploy --only functions:career
firebase deploy --only functions:contact
```

### Step 4: Deploy Hosting (if needed)

If you made changes to the static site:

```bash
# Build the Next.js site
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Verification

After deployment, test the forms:

1. **Career Form**: https://your-site.web.app/careers
   - Fill out the form
   - Upload a resume (PDF/DOC, < 5MB)
   - Submit and check for success message

2. **Contact Form**: https://your-site.web.app/contact
   - Fill out the form
   - Submit and check for success message

3. **Check Logs**:
```bash
firebase functions:log
```

## Troubleshooting

### Issue: "Failed to parse JSON response"
- **Cause**: Functions not deployed or environment variables missing
- **Fix**: Ensure functions are deployed and all env vars are set

### Issue: "Invalid captcha verification"
- **Cause**: Wrong Turnstile secret keys
- **Fix**: Verify `TURNSTILE_CAREER_SECRET_KEY` and `TURNSTILE_CONTACT_SECRET_KEY` are correct

### Issue: "Failed to upload resume"
- **Cause**: Google Cloud Storage not configured
- **Fix**: Verify `GOOGLE_CLOUD_STORAGE_BUCKET` and `GOOGLE_SERVICE_ACCOUNT_KEY` are correct

### Issue: "Failed to submit to Google Sheets"
- **Cause**: Google Sheets API not configured
- **Fix**: 
  1. Ensure `GOOGLE_SHEET_ID` and `GOOGLE_SHEET_ID_CRP` are correct
  2. Verify service account has edit access to the sheets
  3. Make sure Google Sheets API is enabled in Google Cloud Console

## Quick Deploy Command

Run this from the root directory:

```bash
# Install dependencies and deploy everything
cd functions && npm install && cd .. && firebase deploy
```

## Notes

- Functions are deployed to `asia-south1` region (India)
- Career function timeout: 120 seconds (for large file uploads)
- Contact function timeout: 60 seconds
- CORS is enabled for all origins
- Both functions return JSON responses

## Files Modified

1. ✅ `lib/clientApi.ts` - Fixed response cloning bug
2. ✅ `functions/index.js` - Created (new Firebase Functions)
3. ✅ `functions/package.json` - Added dependencies
4. ✅ `firebase.json` - Added API route rewrites
5. ✅ `functions/README.md` - Documentation

## Next Steps

1. **Deploy the functions**: Run the deployment commands above
2. **Test the forms**: Verify both career and contact forms work
3. **Monitor logs**: Use `firebase functions:log` to check for any issues
4. **Clean up**: Once verified, you can remove the old `app/api/` routes if not used elsewhere

## Need Help?

Check the logs for detailed error messages:
```bash
firebase functions:log --only career
firebase functions:log --only contact
```

