# Firebase Functions for SKAPL Website

This directory contains Firebase Cloud Functions that handle API endpoints for the statically exported Next.js website.

## Functions

### 1. `career` - Career Form Submission
- **Endpoint**: `/api/career`
- **Method**: POST
- **Purpose**: Handles job application submissions with resume uploads
- **Features**:
  - Turnstile captcha verification
  - Resume upload to Google Cloud Storage
  - Application data stored in Google Sheets

### 2. `contact` - Contact Form Submission
- **Endpoint**: `/api/contact`
- **Method**: POST
- **Purpose**: Handles contact form submissions
- **Features**:
  - Turnstile captcha verification
  - Form data stored in Google Sheets

## Environment Variables

The following environment variables must be set in Firebase Functions configuration:

```bash
# Firebase Service Account (JSON string)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google Cloud Storage (for resume uploads)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Google Sheets
GOOGLE_SHEET_ID=your-contact-sheet-id
GOOGLE_SHEET_ID_CRP=your-career-sheet-id

# Cloudflare Turnstile
TURNSTILE_CONTACT_SECRET_KEY=0x4AAAAAAA...
TURNSTILE_CAREER_SECRET_KEY=0x4AAAAAAA...
```

### Setting Environment Variables in Firebase

To set environment variables in Firebase Functions:

```bash
# Set a single variable
firebase functions:config:set google.project_id="your-project-id"

# Or use .env file (Firebase Functions v2)
# Create a .env file in the functions directory with the variables above
```

For Firebase Functions v2 (which this project uses), you can use a `.env` file or set them in the Firebase Console under Functions > Configuration.

## Deployment

### Install Dependencies

```bash
cd functions
npm install
```

### Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:career
firebase deploy --only functions:contact
```

### View Logs

```bash
npm run logs
```

## Local Development

For local testing:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Set up environment variables in `.env` file
3. Run emulator: `firebase emulators:start --only functions`

## Dependencies

- `@google-cloud/storage` - For uploading resumes to Cloud Storage
- `cors` - For handling CORS in functions
- `firebase-admin` - Firebase Admin SDK
- `firebase-functions` - Firebase Functions SDK v2
- `formidable` - For parsing multipart form data
- `googleapis` - For Google Sheets API
- `node-fetch` - For Turnstile verification

## Notes

- Functions use Firebase Functions v2 with the `asia-south1` region
- Career function has 120s timeout and 512MiB memory
- Contact function has 60s timeout and 256MiB memory
- All responses are JSON format
- CORS is enabled for all origins

