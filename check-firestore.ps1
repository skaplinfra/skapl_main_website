# Quick script to check Firestore database connection
Write-Host "=== Firestore Database Check ===" -ForegroundColor Cyan
Write-Host ""

# Read service account file
if (Test-Path "serviceAccountKey.json") {
    Write-Host "Reading serviceAccountKey.json..." -ForegroundColor Yellow
    $serviceAccount = Get-Content "serviceAccountKey.json" | ConvertFrom-Json
    
    Write-Host "Project ID from service account: " -NoNewline
    Write-Host $serviceAccount.project_id -ForegroundColor Green
    Write-Host "Client Email: " -NoNewline
    Write-Host $serviceAccount.client_email -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Your Firestore database should be in project: " -NoNewline
    Write-Host $serviceAccount.project_id -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check these URLs:" -ForegroundColor Cyan
    Write-Host "1. Firestore Console: https://console.firebase.google.com/project/$($serviceAccount.project_id)/firestore" -ForegroundColor White
    Write-Host "2. Databases List: https://console.firebase.google.com/project/$($serviceAccount.project_id)/firestore/databases" -ForegroundColor White
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "- Database exists in the project above" -ForegroundColor White
    Write-Host "- Database ID is '(default)' or matches FIRESTORE_DATABASE_ID in .env.local" -ForegroundColor White
    Write-Host "- Cloud Firestore API is enabled: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=$($serviceAccount.project_id)" -ForegroundColor White
    
} else {
    Write-Host "ERROR: serviceAccountKey.json not found!" -ForegroundColor Red
    Write-Host "Place it in: $PWD" -ForegroundColor Yellow
}

Write-Host ""

