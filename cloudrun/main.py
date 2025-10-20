from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage, secretmanager
from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
import httpx
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional
import json

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
GCS_BUCKET = os.getenv("GCS_BUCKET")
GSHEET_ID = os.getenv("GSHEET_ID")
GSHEET_ID_CRP = os.getenv("GSHEET_ID_CRP")
TURNSTILE_CONTACT_SECRET = os.getenv("TURNSTILE_CONTACT_SECRET_KEY")
TURNSTILE_CAREER_SECRET = os.getenv("TURNSTILE_CAREER_SECRET_KEY")
GOOGLE_SERVICE_ACCOUNT_KEY = os.getenv("GOOGLE_SERVICE_ACCOUNT_KEY")

# Initialize Google clients
credentials = None
if GOOGLE_SERVICE_ACCOUNT_KEY:
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(GOOGLE_SERVICE_ACCOUNT_KEY),
        scopes=['https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/cloud-platform']
    )

storage_client = storage.Client(credentials=credentials)
sheets_service = build('sheets', 'v4', credentials=credentials)

# Pydantic models
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    message: str
    turnstileToken: str

async def verify_turnstile(token: str, secret: str) -> bool:
    """Verify Cloudflare Turnstile token"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                json={'secret': secret, 'response': token}
            )
            data = response.json()
            return data.get('success', False)
    except Exception as e:
        print(f"Turnstile verification error: {e}")
        return False

def get_ist_timestamp():
    """Get current timestamp in IST"""
    from datetime import timezone, timedelta
    ist = timezone(timedelta(hours=5, minutes=30))
    return datetime.now(ist).strftime('%Y-%m-%d %H:%M:%S')

def initialize_sheet(sheet_id: str, headers: list):
    """Initialize Google Sheet with headers if empty"""
    try:
        result = sheets_service.spreadsheets().values().get(
            spreadsheetId=sheet_id,
            range='A1:Z1'
        ).execute()
        
        if not result.get('values'):
            sheets_service.spreadsheets().values().update(
                spreadsheetId=sheet_id,
                range='A1',
                valueInputOption='RAW',
                body={'values': [headers]}
            ).execute()
    except Exception as e:
        print(f"Sheet initialization error: {e}")

async def upload_to_gcs(file: UploadFile, applicant_name: str) -> str:
    """Upload file to Google Cloud Storage"""
    bucket = storage_client.bucket(GCS_BUCKET)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    blob_name = f"resumes/{applicant_name.replace(' ', '_')}_{timestamp}_{file.filename}"
    blob = bucket.blob(blob_name)
    
    contents = await file.read()
    blob.upload_from_string(contents, content_type=file.content_type)
    blob.make_public()
    
    return blob.public_url

@app.get("/")
async def root():
    return {"status": "ok", "message": "Forms API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/api/contact")
async def submit_contact_form(
    name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    message: str = Form(...),
    turnstileToken: str = Form(...)
):
    """Handle contact form submission"""
    try:
        # Verify Turnstile
        if TURNSTILE_CONTACT_SECRET:
            is_valid = await verify_turnstile(turnstileToken, TURNSTILE_CONTACT_SECRET)
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid captcha verification")
        
        # Initialize sheet
        headers = ['Timestamp', 'Name', 'Email', 'Phone', 'Company', 'Message', 'Status']
        initialize_sheet(GSHEET_ID, headers)
        
        # Prepare row data
        row = [
            get_ist_timestamp(),
            name,
            email,
            phone or 'N/A',
            company or 'N/A',
            message,
            'New'
        ]
        
        # Append to sheet
        sheets_service.spreadsheets().values().append(
            spreadsheetId=GSHEET_ID,
            range='A:G',
            valueInputOption='RAW',
            body={'values': [row]}
        ).execute()
        
        return {"success": True, "message": "Contact form submitted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/career")
async def submit_career_application(
    name: str = Form(...),
    email: str = Form(...),
    phone: Optional[str] = Form(None),
    position_applied: str = Form(...),
    cover_letter: Optional[str] = Form(None),
    turnstileToken: str = Form(...),
    resume: UploadFile = File(...)
):
    """Handle career application submission"""
    try:
        # Verify Turnstile
        if TURNSTILE_CAREER_SECRET:
            is_valid = await verify_turnstile(turnstileToken, TURNSTILE_CAREER_SECRET)
            if not is_valid:
                raise HTTPException(status_code=400, detail="Invalid captcha verification")
        
        # Validate file
        if resume.size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(status_code=400, detail="File size must be less than 5MB")
        
        allowed_types = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if resume.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Only PDF and DOC files are allowed")
        
        # Upload resume
        resume_url = await upload_to_gcs(resume, name)
        
        # Initialize sheet
        headers = ['Timestamp', 'Name', 'Email', 'Phone', 'Position Applied', 
                   'Cover Letter', 'Resume Link', 'Status']
        initialize_sheet(GSHEET_ID_CRP, headers)
        
        # Prepare row data
        row = [
            get_ist_timestamp(),
            name,
            email,
            phone or 'N/A',
            position_applied,
            cover_letter or 'N/A',
            resume_url,
            'New'
        ]
        
        # Append to sheet
        sheets_service.spreadsheets().values().append(
            spreadsheetId=GSHEET_ID_CRP,
            range='A:H',
            valueInputOption='RAW',
            body={'values': [row]}
        ).execute()
        
        return {"success": True, "message": "Application submitted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)

