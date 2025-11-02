# Firebase Setup Verification Script
# Run this to check if your environment is configured correctly

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Firebase Setup Verification" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$issues = 0
$warnings = 0

# Check if .env.local exists
Write-Host "Checking .env.local file..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local file exists" -ForegroundColor Green
    
    # Read the file
    $envContent = Get-Content ".env.local" -Raw
    
    # Check for Firebase Admin key
    Write-Host "`nChecking Firebase Admin configuration..." -ForegroundColor Yellow
    
    # Check Method 1: File in project root
    if (Test-Path "serviceAccountKey.json") {
        Write-Host "✓ serviceAccountKey.json found in project root" -ForegroundColor Green
        try {
            $jsonContent = Get-Content "serviceAccountKey.json" -Raw | ConvertFrom-Json
            if ($jsonContent.type -eq "service_account") {
                Write-Host "✓ Service account file is valid" -ForegroundColor Green
            } else {
                Write-Host "✗ serviceAccountKey.json does not appear to be a service account" -ForegroundColor Red
                $issues++
            }
        } catch {
            Write-Host "✗ serviceAccountKey.json is not valid JSON" -ForegroundColor Red
            $issues++
        }
    }
    # Check Method 2: Custom path in env
    elseif ($envContent -match "FIREBASE_SERVICE_ACCOUNT_PATH") {
        Write-Host "✓ FIREBASE_SERVICE_ACCOUNT_PATH configured" -ForegroundColor Green
        # Extract the path
        if ($envContent -match "FIREBASE_SERVICE_ACCOUNT_PATH=(.+)") {
            $customPath = $matches[1].Trim()
            if (Test-Path $customPath) {
                Write-Host "✓ Service account file exists at custom path" -ForegroundColor Green
            } else {
                Write-Host "✗ Service account file not found at: $customPath" -ForegroundColor Red
                $issues++
            }
        }
    }
    # Check Method 3: JSON in env variable
    elseif ($envContent -match "FIREBASE_SERVICE_ACCOUNT_KEY") {
        Write-Host "✓ FIREBASE_SERVICE_ACCOUNT_KEY found in .env.local" -ForegroundColor Green
        
        # Check if it looks like valid JSON
        if ($envContent -match "FIREBASE_SERVICE_ACCOUNT_KEY='?\{.*type.*service_account.*\}'?") {
            Write-Host "✓ Service account key appears valid" -ForegroundColor Green
        } else {
            Write-Host "✗ Service account key format looks incorrect" -ForegroundColor Red
            Write-Host "  Make sure it's wrapped in single quotes and contains valid JSON" -ForegroundColor Yellow
            $issues++
        }
    }
    # No method configured
    else {
        Write-Host "✗ No Firebase Admin credentials found!" -ForegroundColor Red
        Write-Host "  Choose one of these methods:" -ForegroundColor Yellow
        Write-Host "  1. Place serviceAccountKey.json in project root (EASIEST)" -ForegroundColor Yellow
        Write-Host "  2. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env.local" -ForegroundColor Yellow
        Write-Host "  3. Set FIREBASE_SERVICE_ACCOUNT_KEY in .env.local" -ForegroundColor Yellow
        Write-Host "  See SIMPLE_SETUP.md for instructions" -ForegroundColor Yellow
        $issues++
    }
    
    # Check for Firebase client config
    Write-Host "`nChecking Firebase client configuration..." -ForegroundColor Yellow
    $clientKeys = @(
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    foreach ($key in $clientKeys) {
        if ($envContent -match $key) {
            Write-Host "✓ $key found" -ForegroundColor Green
        } else {
            Write-Host "✗ $key missing" -ForegroundColor Red
            $issues++
        }
    }
    
    # Check for Turnstile (optional)
    Write-Host "`nChecking Turnstile configuration (optional)..." -ForegroundColor Yellow
    $turnstileKeys = @(
        "NEXT_PUBLIC_TURNSTILE_CONTACT_SITE_KEY",
        "NEXT_PUBLIC_TURNSTILE_CAREER_SITE_KEY",
        "TURNSTILE_CONTACT_SECRET_KEY",
        "TURNSTILE_CAREER_SECRET_KEY"
    )
    
    $turnstileConfigured = $true
    foreach ($key in $turnstileKeys) {
        if ($envContent -match $key) {
            Write-Host "✓ $key found" -ForegroundColor Green
        } else {
            Write-Host "⚠ $key missing (optional in dev mode)" -ForegroundColor Yellow
            $turnstileConfigured = $false
            $warnings++
        }
    }
    
    if (-not $turnstileConfigured) {
        Write-Host "`n  Note: Turnstile is optional in development mode" -ForegroundColor Cyan
        Write-Host "  Forms will work with bypass enabled" -ForegroundColor Cyan
        Write-Host "  See TURNSTILE_SETUP.md to configure for production" -ForegroundColor Cyan
    }
    
} else {
    Write-Host "✗ .env.local file not found!" -ForegroundColor Red
    Write-Host "  Create .env.local in the project root" -ForegroundColor Yellow
    Write-Host "  See SETUP_NOW.md for instructions" -ForegroundColor Yellow
    $issues++
}

# Check for Firebase rules files
Write-Host "`nChecking Firebase rules files..." -ForegroundColor Yellow
if (Test-Path "firestore.rules") {
    Write-Host "✓ firestore.rules exists" -ForegroundColor Green
} else {
    Write-Host "✗ firestore.rules missing" -ForegroundColor Red
    $issues++
}

if (Test-Path "storage.rules") {
    Write-Host "✓ storage.rules exists" -ForegroundColor Green
} else {
    Write-Host "✗ storage.rules missing" -ForegroundColor Red
    $issues++
}

# Check for package.json dependencies
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    if ($packageJson.dependencies."firebase-admin") {
        Write-Host "✓ firebase-admin installed" -ForegroundColor Green
    } else {
        Write-Host "✗ firebase-admin not installed" -ForegroundColor Red
        Write-Host "  Run: npm install firebase-admin" -ForegroundColor Yellow
        $issues++
    }
    
    if ($packageJson.dependencies."firebase") {
        Write-Host "✓ firebase installed" -ForegroundColor Green
    } else {
        Write-Host "✗ firebase not installed" -ForegroundColor Red
        $issues++
    }
}

# Summary
Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($issues -eq 0 -and $warnings -eq 0) {
    Write-Host "✓ All checks passed! Your setup is complete." -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
    Write-Host "2. Test forms at http://localhost:3000/careers" -ForegroundColor White
    Write-Host "3. Deploy rules: firebase deploy --only firestore:rules,storage:rules" -ForegroundColor White
} elseif ($issues -eq 0) {
    Write-Host "✓ Critical setup complete! ($warnings warnings)" -ForegroundColor Green
    Write-Host "`nYour forms will work in development mode." -ForegroundColor Cyan
    Write-Host "Warnings are for optional features (Turnstile)." -ForegroundColor Cyan
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Start dev server: npm run dev" -ForegroundColor White
    Write-Host "2. Test forms at http://localhost:3000/careers" -ForegroundColor White
    Write-Host "3. (Optional) Set up Turnstile - see TURNSTILE_SETUP.md" -ForegroundColor White
} else {
    Write-Host "✗ Setup incomplete: $issues issue(s) found" -ForegroundColor Red
    Write-Host "`nPlease fix the issues above before continuing." -ForegroundColor Yellow
    Write-Host "See SETUP_NOW.md for step-by-step instructions." -ForegroundColor Yellow
}

Write-Host ""

