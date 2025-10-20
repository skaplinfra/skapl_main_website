# 🔐 GitHub Secrets Setup Guide

## Quick Commands to Get All Secret Values

### 1. GOOGLE_SERVICE_ACCOUNT_KEY (JSON as single line)

**Windows PowerShell:**
```powershell
# This converts gs_key.json to a single-line JSON string
$jsonContent = Get-Content gs_key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
Write-Output $jsonContent
```

**Linux/Mac/Git Bash:**
```bash
# If you have jq installed
cat gs_key.json | jq -c '.'

# Or using Python
python -c "import json; print(json.dumps(json.load(open('gs_key.json'))))"

# Or using Node
node -e "console.log(JSON.stringify(require('./gs_key.json')))"
```

Copy the entire output (including curly braces) and paste as the secret value.

### 2. FIREBASE_TOKEN

```bash
firebase login:ci
```

Copy the token it outputs.

### 3. FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD

1. Go to Firebase Console: https://console.firebase.google.com/project/skapl-prod/settings/serviceaccounts/adminsdk
2. Click "Generate New Private Key"
3. Copy the entire JSON content (minified or not - both work)

### 4. Turnstile Keys

Get from Cloudflare Turnstile Dashboard:
- https://dash.cloudflare.com/

You need the **Secret Keys** (not site keys):
- `PROD_TURNSTILE_CONTACT_SECRET_KEY`
- `PROD_TURNSTILE_CAREER_SECRET_KEY`

### 5. Google Sheets IDs

From your sheet URLs:

**Contact Form Sheet:**
```
https://docs.google.com/spreadsheets/d/1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```
`GOOGLE_SHEET_ID` = `1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg`

**Career Form Sheet:**
```
https://docs.google.com/spreadsheets/d/1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```
`GOOGLE_SHEET_ID_CRP` = `1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec`

---

## 📝 Complete Secrets List

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Add these 7 secrets:

| Secret Name | How to Get | Example Format |
|------------|------------|----------------|
| `FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD` | Firebase Console → Generate Key | `{"type":"service_account"...}` |
| `FIREBASE_TOKEN` | `firebase login:ci` | `1//abcd1234...` |
| `PROD_TURNSTILE_CONTACT_SECRET_KEY` | Cloudflare Dashboard | `0x4AAA...` |
| `PROD_TURNSTILE_CAREER_SECRET_KEY` | Cloudflare Dashboard | `0x4BBB...` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Minified gs_key.json | `{"type":"service_account"...}` |
| `GOOGLE_SHEET_ID` | From sheet URL | `1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg` |
| `GOOGLE_SHEET_ID_CRP` | From sheet URL | `1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec` |

---

## ✅ Verify Your JSON is Valid

Before adding as secret, verify it's valid JSON:

**PowerShell:**
```powershell
$json = Get-Content gs_key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
$json | ConvertFrom-Json
# If no error, it's valid!
```

**Linux/Mac:**
```bash
cat gs_key.json | jq -c '.' | jq .
# If it prints nicely formatted JSON, it's valid!
```

**Online:**
Paste into https://jsonlint.com/ to validate

---

## 🔒 Share Google Sheets with Service Account

Get the service account email:

```powershell
# PowerShell
$email = (Get-Content gs_key.json | ConvertFrom-Json).client_email
Write-Output $email
```

```bash
# Linux/Mac
cat gs_key.json | jq -r '.client_email'
```

Then:
1. Open both Google Sheets
2. Click **Share** button
3. Paste the service account email
4. Give **Editor** permissions
5. Click **Send** (uncheck "Notify people")

---

## 🧪 Test Locally Before Deploying

Create `functions/.env`:

```bash
cd functions

# Copy example
cp .env.example .env

# Edit .env with your actual values
notepad .env  # Windows
# or
nano .env     # Linux/Mac
```

Your `functions/.env` should look like:

```env
TURNSTILE_CONTACT_SECRET=0x4AAA...
TURNSTILE_CAREER_SECRET=0x4BBB...
GOOGLE_SHEET_ID=1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg
GOOGLE_SHEET_ID_CRP=1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"skapl-prod"...}
```

**Important:** The JSON must be on ONE line (no line breaks).

Test it:
```bash
cd ..
npm run dev
```

Try submitting a form - it should save to both Supabase and Google Sheets!

---

## 🚀 Deploy

Once all secrets are added:

```bash
git add .
git commit -m "fix: Cloud Functions Gen2 with Google Sheets"
git push origin main
```

GitHub Actions will handle the rest! 🎉

---

## 🆘 Troubleshooting

### "Invalid JSON" error

Your JSON has line breaks. Minify it:
```powershell
(Get-Content gs_key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress) -replace "`n","" -replace "`r",""
```

### "Permission denied" on Google Sheets

Make sure you shared the sheets with your service account email!

### "Service account not found"

Your `GOOGLE_SERVICE_ACCOUNT_KEY` might be missing or invalid. Verify:
```bash
# In functions directory
node -e "console.log(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY).client_email)"
```

Should print an email like `xyz@skapl-prod.iam.gserviceaccount.com`

---

That's it! All secrets configured properly. 🔐

