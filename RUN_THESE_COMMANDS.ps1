# Firebase Deployment - Run These Commands (PowerShell)

Write-Host "🚀 Firebase Gen 2 Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
Set-Location functions
npm install
Set-Location ..
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Convert gs_key.json to single-line for GitHub Secret
Write-Host "🔑 Step 2: Generate GOOGLE_SERVICE_ACCOUNT_KEY value" -ForegroundColor Yellow
Write-Host "Copy this value and add it as a GitHub Secret:" -ForegroundColor White
Write-Host "---" -ForegroundColor Gray
$jsonContent = Get-Content gs_key.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
Write-Output $jsonContent
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Step 3: Get service account email for sharing sheets
Write-Host "📧 Step 3: Share Google Sheets with this email:" -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
$email = (Get-Content gs_key.json | ConvertFrom-Json).client_email
Write-Output $email
Write-Host "---" -ForegroundColor Gray
Write-Host "Share both sheets with Editor permissions:" -ForegroundColor White
Write-Host "  - Contact: https://docs.google.com/spreadsheets/d/1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg" -ForegroundColor Cyan
Write-Host "  - Career: https://docs.google.com/spreadsheets/d/1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec" -ForegroundColor Cyan
Write-Host ""

# Step 4: Enable required APIs
Write-Host "☁️  Step 4: Enable Google Cloud APIs" -ForegroundColor Yellow
Write-Host "Run these commands:" -ForegroundColor White
Write-Host "---" -ForegroundColor Gray
Write-Host "gcloud services enable cloudfunctions.googleapis.com --project=skapl-prod"
Write-Host "gcloud services enable cloudbuild.googleapis.com --project=skapl-prod"
Write-Host "gcloud services enable run.googleapis.com --project=skapl-prod"
Write-Host "gcloud services enable sheets.googleapis.com --project=skapl-prod"
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Step 5: Show required GitHub Secrets
Write-Host "🔐 Step 5: Add these GitHub Secrets" -ForegroundColor Yellow
Write-Host "Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "Required secrets:" -ForegroundColor White
Write-Host "  1. FIREBASE_SERVICE_ACCOUNT_SKAPL_PROD - From Firebase Console"
Write-Host "  2. FIREBASE_TOKEN - Run: firebase login:ci"
Write-Host "  3. PROD_TURNSTILE_CONTACT_SECRET_KEY - From Cloudflare"
Write-Host "  4. PROD_TURNSTILE_CAREER_SECRET_KEY - From Cloudflare"
Write-Host "  5. GOOGLE_SERVICE_ACCOUNT_KEY - (Generated above ⬆️)"
Write-Host "  6. GOOGLE_SHEET_ID - 1uz8aFar1yDBDGbwRx0bHCyhUfnhhdOoW1-5UTA9Dskg"
Write-Host "  7. GOOGLE_SHEET_ID_CRP - 1UIaKmniZs6c_SPVh4flidaalQeUBdb4DgYTPc4O0Vec"
Write-Host ""

# Step 6: Deploy
Write-Host "🚢 Step 6: Deploy to Firebase" -ForegroundColor Yellow
Write-Host "After setting up GitHub Secrets, run:" -ForegroundColor White
Write-Host "---" -ForegroundColor Gray
Write-Host "git add ."
Write-Host 'git commit -m "fix: migrate to Firebase Gen2 with Google Sheets"'
Write-Host "git push origin main"
Write-Host "---" -ForegroundColor Gray
Write-Host ""

Write-Host "✨ Setup complete! Follow the steps above to deploy." -ForegroundColor Green
Write-Host ""
Write-Host "📖 For detailed instructions, see:" -ForegroundColor White
Write-Host "  - SETUP_SECRETS.md - How to configure GitHub Secrets"
Write-Host "  - DEPLOY_NOW.md - Complete deployment guide"
Write-Host "  - DEPLOYMENT_GUIDE.md - Technical details"
Write-Host ""

# Pause so user can read
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

