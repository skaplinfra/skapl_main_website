# 🔍 Debug: Check Function Logs

## The Problem

You're getting `400 Bad Request` with "Invalid security token". This means:
- ✅ Functions are deployed and working
- ❌ Turnstile verification is failing

## 🔍 Check Function Logs

To see what's happening, check the Firebase Function logs:

```powershell
# View recent logs
firebase functions:log --limit 20

# Or view logs for specific function
firebase functions:log submitContactForm --limit 10
```

Look for:
- "TURNSTILE_CONTACT_SECRET not set" → Secrets aren't configured
- "Turnstile verification failed" → Secret is wrong or token is invalid
- "Turnstile verification successful" → Verification works

## 🔧 Quick Fixes

### If logs show "Secret not set":

1. **Set secrets:**
   ```powershell
   .\set-function-secrets.ps1
   ```

2. **Or skip verification temporarily:**
   - The function should already skip if secrets aren't set
   - Make sure you redeployed with the latest code:
   ```powershell
   .\deploy-functions.ps1
   ```

### If logs show "Verification failed":

The Turnstile token might be:
1. **Expired** → Refresh the page and try again
2. **Wrong domain** → Check Turnstile site configuration
3. **Wrong secret** → Verify secret matches your Turnstile site

## ✅ Verify Turnstile Configuration

1. **Check Turnstile Site Settings:**
   - Go to: https://dash.cloudflare.com/ → Turnstile → Sites
   - Verify domain: `skapl-prod.web.app` is added
   - Copy the Secret Key

2. **Verify Secret is Set:**
   ```powershell
   firebase functions:secrets:access TURNSTILE_CONTACT_SECRET
   ```

3. **Check Function Uses Secret:**
   - View logs to see if secret is being used
   - Look for "Secret used: Present" in logs

## 🚀 Next Steps

1. **Check logs first** to see what's happening
2. **If secret not set** → Run `.\set-function-secrets.ps1`
3. **If verification failing** → Check Turnstile domain configuration
4. **Redeploy** if you made changes: `.\deploy-functions.ps1`

---

**Run `firebase functions:log --limit 20` to see what's happening!** 🔍

