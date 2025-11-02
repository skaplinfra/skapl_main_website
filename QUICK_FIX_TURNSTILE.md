# 🔧 Quick Fix: "Invalid security token" Error

## The Problem

You're getting `Error: Invalid security token` because Turnstile secrets aren't set in Firebase Functions yet.

## ✅ Solution: Set Secrets Now

### Step 1: Run the Script

```powershell
.\set-function-secrets.ps1
```

This will:
1. Ask you to enter `TURNSTILE_CONTACT_SECRET` (paste your secret)
2. Ask you to enter `TURNSTILE_CAREER_SECRET` (paste your secret)
3. Deploy functions with secrets configured

### Step 2: Find Your Secrets

If you don't have your secrets:

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Turnstile** → **Sites**
3. Click on your Contact Form site → Copy the **Secret Key**
4. Click on your Career Form site → Copy the **Secret Key**

### Step 3: Manual Alternative

If the script doesn't work:

```powershell
# Set environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS = "$PWD\serviceAccountKey.json"

# Set Firebase project
firebase use skapl-prod --non-interactive

# Set secrets (will prompt for values)
firebase functions:secrets:set TURNSTILE_CONTACT_SECRET
firebase functions:secrets:set TURNSTILE_CAREER_SECRET

# Redeploy functions
firebase deploy --only functions --force
```

---

## 🔍 Verify Secrets Are Set

After setting secrets, verify:

```powershell
firebase functions:secrets:access TURNSTILE_CONTACT_SECRET
firebase functions:secrets:access TURNSTILE_CAREER_SECRET
```

If they show values, secrets are set correctly.

---

## ⚠️ Temporary Workaround

If you want forms to work **without Turnstile verification** (not recommended for production):

The functions are already configured to skip verification if secrets aren't set. But you need to **redeploy** them:

```powershell
.\deploy-functions.ps1
```

Forms will work but won't have bot protection.

---

## ✅ After Setting Secrets

1. ✅ Secrets will be stored securely in Firebase Secrets Manager
2. ✅ Functions will automatically use them
3. ✅ Turnstile verification will work
4. ✅ Forms will have full bot protection
5. ✅ No more "Invalid security token" errors

---

**Run `.\set-function-secrets.ps1` now to fix the error!** 🚀

