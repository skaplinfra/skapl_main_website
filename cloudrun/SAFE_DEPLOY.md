# 🛡️ SAFE DEPLOYMENT GUIDE

## ✅ Pre-Deployment Checklist

### 1. Verify Current Production is Running
```bash
# Test current website
curl https://skapl-prod.web.app/

# Should return your homepage HTML
```

### 2. Verify GitHub Secrets
Go to: https://github.com/YOUR_ORG/skapl_main_website/settings/secrets/actions

**Required Secrets:**
- ✅ `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON with GCS + Sheets permissions)
- ✅ `GOOGLE_CLOUD_STORAGE_BUCKET` (e.g., `skapl-resumes`)
- ✅ `GOOGLE_SHEET_ID` (Contact form sheet)
- ✅ `GOOGLE_SHEET_ID_CRP` (Career form sheet)
- ✅ `TURNSTILE_CONTACT_SECRET_KEY`
- ✅ `TURNSTILE_CAREER_SECRET_KEY`
- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY`

---

## 🚀 Deployment Process

The deployment is **SAFE** because:

1. ✅ **Static site deploys FIRST** - Your website keeps running
2. ✅ **Cloud Run deploys with `--no-traffic`** - New version doesn't receive traffic yet
3. ✅ **Health check runs** - Tests the new Cloud Run service
4. ✅ **Traffic switches only if tests pass** - Automatic rollback on failure
5. ✅ **Firebase Hosting rewrite** - Seamless integration

### What Happens During Deployment:

```
1. Build Next.js static site → Deploy to Firebase Hosting (site is live)
2. Build Docker image → Push to GCR
3. Deploy Cloud Run → BUT NO TRAFFIC YET (--no-traffic flag)
4. Run health check → Test /health endpoint
5. IF PASS: Route traffic to new revision
   IF FAIL: Keep old revision, deployment fails safely
6. Update Firebase Hosting rewrite → /api/** → Cloud Run
```

---

## 🧪 Testing After Deployment

### 1. Test Health Endpoint
```bash
curl https://skapl-prod.web.app/api/health
# Expected: {"status":"healthy"}
```

### 2. Test Contact Form (with dummy data)
```bash
curl -X POST https://skapl-prod.web.app/api/contact \
  -F "name=Test User" \
  -F "email=test@example.com" \
  -F "message=Test message" \
  -F "turnstileToken=dummy"

# Expected: {"success":true,...} or captcha error
```

### 3. Check Cloud Run Logs
```bash
gcloud run services logs read forms-api \
  --region us-central1 \
  --project skapl-prod \
  --limit 50
```

---

## 🔄 Rollback Plan

### If Something Goes Wrong:

#### Option 1: Rollback Cloud Run (Fast)
```bash
# List revisions
gcloud run revisions list --service=forms-api --region=us-central1 --project=skapl-prod

# Rollback to previous revision
gcloud run services update-traffic forms-api \
  --to-revisions=forms-api-00001-abc=100 \
  --region=us-central1 \
  --project=skapl-prod

# Replace 'forms-api-00001-abc' with the previous working revision
```

#### Option 2: Remove Cloud Run Integration (Safest)
```bash
# Edit firebase.json locally, remove the Cloud Run rewrite:
{
  "rewrites": [
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}

# Redeploy hosting only
firebase deploy --only hosting --project skapl-prod
```

#### Option 3: Emergency - Disable Cloud Run Service
```bash
# This stops the service (website still works, forms won't submit)
gcloud run services update forms-api \
  --no-traffic \
  --region=us-central1 \
  --project=skapl-prod
```

---

## 📊 Monitoring

### Check Service Status
```bash
gcloud run services describe forms-api \
  --region=us-central1 \
  --project=skapl-prod \
  --format=yaml
```

### View Traffic Split
```bash
gcloud run services describe forms-api \
  --region=us-central1 \
  --project=skapl-prod \
  --format="value(status.traffic)"
```

### Check Error Rate
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=forms-api AND severity>=ERROR" \
  --limit 50 \
  --project=skapl-prod \
  --format=json
```

---

## ⚠️ What CANNOT Break

- ✅ **Main website** - Static files, always served from Firebase Hosting
- ✅ **Existing pages** - All routes work (about, services, etc.)
- ✅ **SEO** - No impact, same URLs

## ⚠️ What MIGHT Break (and how to fix)

| Issue | Symptom | Fix |
|-------|---------|-----|
| Forms don't submit | 403/500 error | Check Cloud Run logs, verify env vars |
| Resume upload fails | Error on career form | Check GCS bucket permissions |
| Sheets not updating | Success but no data | Check service account has Editor on sheets |
| Turnstile fails | Captcha error | Verify secret keys are correct |

---

## 🎯 Success Criteria

After deployment, verify:

- [ ] Homepage loads: https://skapl-prod.web.app/
- [ ] Contact form submits successfully
- [ ] Career form accepts resume upload
- [ ] Data appears in Google Sheets
- [ ] Resume appears in GCS bucket
- [ ] No errors in Cloud Run logs
- [ ] No 403/500 errors in browser console

---

## 📞 Emergency Contacts

If you need to revert EVERYTHING:

```bash
# Revert to previous Firebase Hosting deployment
firebase hosting:channel:list --project skapl-prod
firebase hosting:rollback --project skapl-prod

# Or redeploy from last known good commit
git checkout <last-good-commit>
firebase deploy --only hosting --project skapl-prod
```

---

## 💡 Pro Tips

1. **Deploy during low-traffic hours** (e.g., early morning)
2. **Monitor logs for first 10-15 minutes** after deployment
3. **Test forms immediately** after deployment
4. **Keep this terminal open** with gcloud authenticated for quick rollback
5. **Don't panic** - Rollback is easy and fast (< 2 minutes)

