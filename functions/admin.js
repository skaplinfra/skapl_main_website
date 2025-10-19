const admin = require('firebase-admin');
const fs = require('fs');

// Initialize the Firebase Admin SDK
if (!admin.apps.length) {
  let serviceAccount;
  
  try {
    // Priority 1: Firebase service account from file path (set during deployment)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('Using Firebase service account from file:', serviceAccountPath);
    }
    // Priority 2: Firebase service account from environment variable (JSON string)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      console.log('Using Firebase service account from environment variable');
    }
    // Priority 3: GCP service account file (for CLI operations)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
      console.log('Using GCP service account from file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    }
  } catch (error) {
    console.error('Error loading service account key:', error);
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });
    console.log('Firebase Admin initialized with custom credentials');
  } else {
    // Default initialization (uses default credentials or metadata service)
    admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials');
  }
}

module.exports = admin; 