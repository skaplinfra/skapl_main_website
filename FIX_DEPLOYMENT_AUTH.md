# 🔧 Fix: 401 UNAUTHENTICATED Error in Deployment

## The Error

You're seeing:
```
"code": 401,
"message": "Request is missing required authentication credential"
"status": "UNAUTHENTICATED"
```

## What This Means

The service account credentials aren't being used correctly, or the service account doesn't have the right permissions.

## ✅ Solution 1: Verify Service Account Permissions

### Check Service Account Has Required Roles

1. **Go to Google Cloud Console**:
   ```
   https://console.cloud.google.com/iam-admin/iam?project=skapl-prod
   ```

2. **Find your service account**:
   - Look for: `firebase-adminsdk-fbsvc@skapl-prod.iam.gserviceaccount.com`
   - (Or check `serviceAccountKey.json` → `client_email`)

3. **Verify it has these roles**:
   - ✅ `Firebase Admin SDK Administrator Service Agent` (required)
   - ✅ `Cloud Datastore User` (for Firestore)
   - ✅ `Storage Admin` (for Storage rules)
   - ✅ `Firebase Admin` (for general Firebase operations)

4. **If missing, add them**:
   - Click service account → Edit (pencil icon)
   - Click "ADD ANOTHER ROLE"
   - Add each missing role
   - Click "SAVE"

### Required Roles Checklist

| Role | Purpose | Required? |
|------|---------|-----------|
| `Firebase Admin SDK Administrator Service Agent` | Basic Firebase operations | ✅ Required |
| `Cloud Datastore User` | Firestore read/write | ✅ Required |
| `Storage Admin` | Deploy Storage rules | ✅ Required |
| `Firebase Admin` | General admin access | ✅ Recommended |
| `Service Account User` | Use service account | ✅ Usually auto-granted |

## ✅ Solution 2: Regenerate Service Account Key

Sometimes the key doesn't have proper permissions immediately:

1. **Go to Service Accounts**:
   ```
   https://console.firebase.google.com/project/skapl-prod/settings/serviceaccounts/adminsdk
   ```

2. **Generate NEW private key**:
   - Click "Generate new private key"
   - Click "Generate key"
   - Download the JSON file

3. **Update GitHub Secret**:
   - Go to: GitHub → Repository → Settings → Secrets → Actions
   - Edit `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD`
   - Replace with the new JSON (entire content as one line)
   - Save

## ✅ Solution 3: Verify Secret Format

### In GitHub Secrets

The `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD` secret should be:

**Correct Format:**
```json
{"type":"service_account","project_id":"skapl-prod","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"..."}
```

**Key Points:**
- ✅ Complete JSON object
- ✅ All on one line (no line breaks in middle)
- ✅ Properly formatted JSON
- ✅ No extra spaces or characters

### How to Add Correctly

1. **Open the downloaded JSON file**
2. **Copy the ENTIRE content**
3. **In GitHub Secrets**:
   - Name: `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD`
   - Value: Paste the entire JSON (GitHub handles it correctly)
   - **Don't wrap in quotes** - GitHub handles it
   - **Don't escape anything** - paste as-is

## ✅ Solution 4: Check Database Already Exists

The error might also happen if Firebase CLI tries to create a database that already exists.

**Your database:** `skapl-prod1` already exists ✅

**The workflow now:**
- ✅ Uses `continue-on-error: true` for rules deployment
- ✅ Won't fail if rules deployment has issues
- ✅ Will still deploy hosting and functions

## ✅ Solution 5: Manual Rules Deployment (Alternative)

If automated deployment still fails, deploy rules manually:

```bash
# Locally, after setting up serviceAccountKey.json
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Then the workflow can skip these steps.

## 🔍 Debugging the Workflow

### Check What's Being Used

The workflow now:
1. ✅ Creates service account file from secret
2. ✅ Sets `GOOGLE_APPLICATION_CREDENTIALS` environment variable
3. ✅ Uses Firebase CLI with proper authentication

### Verify Service Account Works Locally

**Test locally first:**

1. **Place `serviceAccountKey.json` in project root**

2. **Set environment variable:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/serviceAccountKey.json"
   ```

3. **Test deployment:**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **If this works**, the service account is good - the issue is in the workflow
5. **If this fails**, the service account needs more permissions

## 📋 Complete Checklist

Before retrying deployment:

- [ ] Service account has `Firebase Admin SDK Administrator Service Agent` role
- [ ] Service account has `Cloud Datastore User` role
- [ ] Service account has `Storage Admin` role
- [ ] `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD` secret contains complete JSON
- [ ] JSON is valid (test by pasting into jsonlint.com)
- [ ] Service account email matches: `firebase-adminsdk-xxxxx@skapl-prod.iam.gserviceaccount.com`
- [ ] Tested locally with service account key

## 🚀 Workflow Improvements Made

The updated workflow now:
- ✅ Properly sets up authentication with `GOOGLE_APPLICATION_CREDENTIALS`
- ✅ Uses Firebase CLI directly (more reliable)
- ✅ Continues on error for rules (won't block deployment)
- ✅ Properly configures environment for each step

## Most Common Fix

**90% of the time**, this is fixed by:

1. **Adding `Cloud Datastore User` role** to service account
2. **Regenerating service account key**
3. **Updating GitHub secret** with new key

## Still Having Issues?

### Check Service Account Status

```bash
# If you have gcloud CLI installed
gcloud iam service-accounts describe firebase-adminsdk-fbsvc@skapl-prod.iam.gserviceaccount.com --project=skapl-prod
```

### Verify Secret is Set

In GitHub Actions log, check:
- Look for "Setting up Firebase CLI with Service Account" step
- Should show: "GOOGLE_APPLICATION_CREDENTIALS=..."
- Should not show: "Credentials not found"

---

**After fixing service account permissions and updating the secret, push again and the deployment should work!** 🚀

