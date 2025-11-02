import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as path from 'path';
import * as fs from 'fs';

let adminApp: App;

// Initialize Firebase Admin SDK for server-side operations
export function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  if (getApps().length > 0) {
    adminApp = getApps()[0] as App;
    return adminApp;
  }

  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Method 1: Try to load from file path (easiest for local development)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                                path.join(process.cwd(), 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('Using service account from file:', serviceAccountPath);
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      // Use project ID from service account (most reliable)
      const serviceAccountProjectId = serviceAccount.project_id;
      const envProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const projectId = serviceAccountProjectId || envProjectId;
      const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                           `${projectId}.appspot.com`;
      
      console.log('Project ID from service account:', serviceAccountProjectId);
      console.log('Project ID from environment:', envProjectId);
      console.log('Using Project ID:', projectId);
      console.log('Storage Bucket:', storageBucket);
      
      // Warn if there's a mismatch
      if (serviceAccountProjectId && envProjectId && serviceAccountProjectId !== envProjectId) {
        console.warn('⚠️  WARNING: Project ID mismatch!');
        console.warn(`   Service account is for: ${serviceAccountProjectId}`);
        console.warn(`   Environment expects: ${envProjectId}`);
        console.warn(`   Using service account project: ${serviceAccountProjectId}`);
        console.warn('   Make sure your Firestore database is in the same project!');
      }
      
      if (!projectId) {
        throw new Error('Project ID not found in service account or environment variables');
      }
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        storageBucket,
        projectId,
      });
      console.log('Firebase Admin SDK initialized successfully');
      return adminApp;
    }
    
    // Fallback to environment variables
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    console.log('Project ID from env:', projectId);
    console.log('Storage Bucket:', storageBucket);
    
    if (!storageBucket || !projectId) {
      throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET and NEXT_PUBLIC_FIREBASE_PROJECT_ID must be set');
    }
    
    // Method 2: Try to use environment variable with JSON string
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountEnv) {
      console.log('Using service account from environment variable');
      try {
        const serviceAccountJson = JSON.parse(serviceAccountEnv);
        adminApp = initializeApp({
          credential: cert(serviceAccountJson),
          storageBucket,
          projectId,
        });
        console.log('Firebase Admin SDK initialized successfully');
        return adminApp;
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', parseError);
        throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT_KEY JSON');
      }
    }
    
    // Method 3: Try application default credentials (works in Firebase Functions)
    console.log('No service account file or env variable found');
    console.log('Trying application default credentials (development mode)');
    try {
      adminApp = initializeApp({
        credential: applicationDefault(),
        storageBucket,
        projectId,
      });
      console.log('Firebase Admin SDK initialized successfully');
      return adminApp;
    } catch (credError) {
      console.error('Failed to use application default credentials:', credError);
      throw new Error(
        'No Firebase Admin credentials found. Please:\n' +
        '1. Place serviceAccountKey.json in project root, OR\n' +
        '2. Set FIREBASE_SERVICE_ACCOUNT_PATH env variable, OR\n' +
        '3. Set FIREBASE_SERVICE_ACCOUNT_KEY env variable'
      );
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    if (error instanceof Error) {
      throw new Error(`Firebase Admin initialization failed: ${error.message}`);
    }
    throw error;
  }
}

export function getAdminFirestore() {
  const app = getAdminApp();
  
  // Get database ID from environment or use default
  // Try multiple common database IDs
  const databaseId = process.env.FIRESTORE_DATABASE_ID || 'skapl-prod1';
  
  console.log('=== Firestore Connection Info ===');
  console.log('Database ID:', databaseId);
  console.log('Project ID:', app.options.projectId);
  console.log('================================');
  
  // Explicitly specify the database ID
  try {
    const db = getFirestore(app, databaseId);
    return db;
  } catch (error: any) {
    console.error('Failed to get Firestore with database ID:', databaseId);
    console.error('Error:', error.message);
    console.error('Trying with default database...');
    
    // Fallback: try without specifying database ID
    return getFirestore(app);
  }
}

export function getAdminStorage() {
  const app = getAdminApp();
  const projectId = app.options.projectId;
  
  // Try different bucket name formats
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                        `${projectId}.firebasestorage.app` ||
                        `${projectId}.appspot.com`;
  
  console.log('=== Storage Connection Info ===');
  console.log('Project ID:', projectId);
  console.log('Storage Bucket:', storageBucket);
  console.log('================================');
  
  // Explicitly specify the bucket
  const storage = getStorage(app);
  return storage;
}

