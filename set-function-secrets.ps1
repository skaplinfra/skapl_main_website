# PowerShell script to set Turnstile secrets in Firebase Functions
# Run this to configure Turnstile secrets for your deployed functions

Write-Host "Setting Turnstile Secrets in Firebase Functions" -ForegroundColor Cyan
Write-Host ""

# Check if serviceAccountKey.json exists
if (-not (Test-Path "serviceAccountKey.json")) {
    Write-Host "ERROR: serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "Please make sure serviceAccountKey.json is in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Found serviceAccountKey.json" -ForegroundColor Green

# Set environment variable for service account
$env:GOOGLE_APPLICATION_CREDENTIALS = "$PWD\serviceAccountKey.json"
Write-Host "OK: Set GOOGLE_APPLICATION_CREDENTIALS" -ForegroundColor Green

# Check if firebase CLI is installed
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "OK: Firebase CLI version: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

Write-Host ""
Write-Host "Setting Firebase project to skapl-prod..." -ForegroundColor Cyan
firebase use skapl-prod --non-interactive

Write-Host ""
Write-Host "Setting Turnstile Secrets..." -ForegroundColor Cyan
Write-Host ""
Write-Host "You will be prompted to enter the secret values." -ForegroundColor Yellow
Write-Host "You can find these in: https://dash.cloudflare.com/ → Turnstile → Sites" -ForegroundColor Yellow
Write-Host ""

# Set Turnstile Contact Secret
Write-Host "1. Setting TURNSTILE_CONTACT_SECRET..." -ForegroundColor Cyan
firebase functions:secrets:set TURNSTILE_CONTACT_SECRET

# Set Turnstile Career Secret
Write-Host ""
Write-Host "2. Setting TURNSTILE_CAREER_SECRET..." -ForegroundColor Cyan
firebase functions:secrets:set TURNSTILE_CAREER_SECRET

Write-Host ""
Write-Host "OK: Secrets configured!" -ForegroundColor Green
Write-Host ""
Write-Host "Redeploying functions to apply secrets..." -ForegroundColor Cyan
firebase deploy --only functions --force

Write-Host ""
Write-Host "Done! Your forms now have full Turnstile protection." -ForegroundColor Green

