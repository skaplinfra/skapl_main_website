# 🔐 GitHub Secrets Setup Guide for Production

## Overview

This guide lists all GitHub repository secrets needed for the Firebase production deployment workflow.

## Required Secrets

Add these secrets in: **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

---

## 🔥 Firebase Configuration Secrets

### 1. Firebase Client Configuration (for Next.js build)

These are from your Firebase project settings: https://console.firebase.google.com/project/skapl-prod/settings/general

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `PROD_FIREBASE_API_KEY` | Firebase API Key | Firebase Console → Project Settings → General → Your apps → Web app → API Key |
| `PROD_FIREBASE_AUTH_DOMAIN` | Auth Domain | `skapl-prod.firebaseapp.com` |
| `PROD_FIREBASE_PROJECT_ID` | Project ID | `skapl-prod` |
| `PROD_FIREBASE_STORAGE_BUCKET` | Storage Bucket | `skapl-prod.firebasestorage.app` or `skapl-prod.appspot.com` |
| `PROD_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | Firebase Console → Project Settings → General → Cloud Messaging |
| `PROD_FIREBASE_APP_ID` | App ID | Firebase Console → Project Settings → General → Your apps → Web app |

**How to get these:**
1. Go to: https://console.firebase.google.com/project/skapl-prod/settings/general
2. Scroll to "Your apps" section
3. Click on your web app (or create one if needed)
4. Copy all the config values

### 2. Firestore Database

| Secret Name | Description | Value |
|-------------|-------------|-------|
| `PROD_FIRESTORE_DATABASE_ID` | Firestore Database ID | `skapl-prod1` (or `(default)` if that's your database name) |

**How to find:**
1. Go to: https://console.firebase.google.com/project/skapl-prod/firestore/databases
2. Note the Database ID shown (should be `skapl-prod1` based on your setup)

### 3. Firebase Service Account (for deployment)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD` | Complete service account JSON | See instructions below |

**How to get:**
1. Go to: https://console.firebase.google.com/project/skapl-prod/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Click **"Generate key"**
4. **Copy the ENTIRE JSON content** (all of it, as one long string)
5. In GitHub Secrets, paste it as the secret value
6. **Important**: Wrap in single quotes if needed, or paste as-is if GitHub accepts it

---

## 🛡️ Turnstile Configuration Secrets

| Secret Name | Description | Where to Find |
|-------------|-------------|---------------|
| `PROD_TURNSTILE_CONTACT_SITE_KEY` | Contact form site key | Cloudflare Dashboard → Turnstile → Your site → Site Key |
| `PROD_TURNSTILE_CAREER_SITE_KEY` | Career form site key | Cloudflare Dashboard → Turnstile → Your site → Site Key |
| `PROD_TURNSTILE_CONTACT_SECRET_KEY` | Contact form secret key | Cloudflare Dashboard → Turnstile → Your site → Secret Key |
| `PROD_TURNSTILE_CAREER_SECRET_KEY` | Career form secret key | Cloudflare Dashboard → Turnstile → Your site → Secret Key |

**How to get:**
1. Go to: https://dash.cloudflare.com/
2. Navigate to **Turnstile**
3. Select your sites (one for contact, one for career)
4. Copy the **Site Key** (public) and **Secret Key** (private) for each

**Note**: Create separate Turnstile sites for production (different from development)

---

## 📋 Complete Secrets Checklist

### Required (Critical):
- [ ] `PROD_FIREBASE_API_KEY`
- [ ] `PROD_FIREBASE_AUTH_DOMAIN`
- [ ] `PROD_FIREBASE_PROJECT_ID`
- [ ] `PROD_FIREBASE_STORAGE_BUCKET`
- [ ] `PROD_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `PROD_FIREBASE_APP_ID`
- [ ] `PROD_FIRESTORE_DATABASE_ID`
- [ ] `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD`
- [ ] `PROD_TURNSTILE_CONTACT_SITE_KEY`
- [ ] `PROD_TURNSTILE_CAREER_SITE_KEY`
- [ ] `PROD_TURNSTILE_CONTACT_SECRET_KEY`
- [ ] `PROD_TURNSTILE_CAREER_SECRET_KEY`

### Optional (if you have Firebase token):
- [ ] `FIREBASE_TOKEN` (for some deployment operations)

---

## 🚀 Quick Setup Steps

### Step 1: Add Firebase Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each Firebase secret from the table above
5. Get values from: https://console.firebase.google.com/project/skapl-prod/settings/general

### Step 2: Add Firestore Database ID

1. Create secret: `PROD_FIRESTORE_DATABASE_ID`
2. Value: `skapl-prod1` (or whatever your database ID is)
3. Find it at: https://console.firebase.google.com/project/skapl-prod/firestore/databases

### Step 3: Add Service Account

1. Generate service account key: https://console.firebase.google.com/project/skapl-prod/settings/serviceaccounts/adminsdk
2. Copy the entire JSON
3. Create secret: `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD`
4. Paste the complete JSON as the value
5. **Important**: Keep it as one line if possible, or GitHub will handle it

### Step 4: Add Turnstile Secrets

1. Create 4 secrets for Turnstile (contact and career, each with site + secret keys)
2. Get from: https://dash.cloudflare.com/ → Turnstile

### Step 5: Verify All Secrets

Run through the checklist above to make sure everything is added.

---

## 📝 Example Secret Values

### Firebase Config Example:
```
PROD_FIREBASE_API_KEY=AIzaSyABC123xyz...
PROD_FIREBASE_AUTH_DOMAIN=skapl-prod.firebaseapp.com
PROD_FIREBASE_PROJECT_ID=skapl-prod
PROD_FIREBASE_STORAGE_BUCKET=skapl-prod.firebasestorage.app
PROD_FIREBASE_MESSAGING_SENDER_ID=123456789012
PROD_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### Firestore Database:
```
PROD_FIRESTORE_DATABASE_ID=skapl-prod1
```

### Service Account (JSON format):
```
FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD={"type":"service_account","project_id":"skapl-prod","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@skapl-prod.iam.gserviceaccount.com",...}
```

### Turnstile Example:
```
PROD_TURNSTILE_CONTACT_SITE_KEY=0x4AAAAAAA...
PROD_TURNSTILE_CONTACT_SECRET_KEY=0x4AAAAAAA... (different key)
PROD_TURNSTILE_CAREER_SITE_KEY=0x4AAAAAAA...
PROD_TURNSTILE_CAREER_SECRET_KEY=0x4AAAAAAA... (different key)
```

---

## 🔍 Verify Secrets Are Set

After adding all secrets:

1. Go to: **Repository → Settings → Secrets and variables → Actions**
2. You should see all 12+ secrets listed
3. Make sure they're all named exactly as shown above

---

## 🧪 Test the Workflow

1. **Push to the `demo` branch**:
   ```bash
   git push origin demo
   ```

2. **Check GitHub Actions**:
   - Go to: Repository → Actions tab
   - Watch the workflow run
   - If any secrets are missing, you'll see errors

3. **Common Errors:**
   - `Secret not found` → Add the missing secret
   - `Invalid JSON` → Check service account JSON format
   - `Bucket not found` → Verify `PROD_FIREBASE_STORAGE_BUCKET` value
   - `Database not found` → Verify `PROD_FIRESTORE_DATABASE_ID` value

---

## 🔒 Security Notes

1. ✅ **Never commit secrets to code** - Use GitHub Secrets only
2. ✅ **Use separate secrets for production** - Don't reuse development secrets
3. ✅ **Rotate secrets periodically** - Especially service account keys
4. ✅ **Limit secret access** - Only repository admins should see secrets
5. ✅ **Review workflow permissions** - Ensure minimal required permissions

---

## 📚 Quick Reference Links

- **Firebase Console**: https://console.firebase.google.com/project/skapl-prod
- **Firebase Config**: https://console.firebase.google.com/project/skapl-prod/settings/general
- **Service Accounts**: https://console.firebase.google.com/project/skapl-prod/settings/serviceaccounts/adminsdk
- **Firestore Databases**: https://console.firebase.google.com/project/skapl-prod/firestore/databases
- **GitHub Secrets**: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
- **Cloudflare Turnstile**: https://dash.cloudflare.com/ → Turnstile

---

## 🎯 What Happens During Deployment

The workflow will:

1. ✅ Build Next.js static site with Firebase config
2. ✅ Deploy Firestore security rules
3. ✅ Deploy Storage security rules
4. ✅ Deploy to Firebase Hosting (production target)
5. ✅ Deploy Cloud Functions

All using the secrets you configured above!

---

## ✅ Final Checklist

Before your first deployment:

- [ ] All 12+ secrets added to GitHub
- [ ] Service account JSON is complete and valid
- [ ] Firestore database ID matches your actual database
- [ ] Storage bucket name is correct
- [ ] Turnstile keys are for production sites
- [ ] Test push to `demo` branch
- [ ] Verify workflow completes successfully
- [ ] Check deployed site works

---

**Once all secrets are configured, push to `demo` branch and watch the magic happen!** 🚀

