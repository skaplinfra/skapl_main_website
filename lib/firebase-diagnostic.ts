// Diagnostic utility to check Firebase setup
import { getAdminApp } from './firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export async function diagnoseFirebase() {
  // Skip diagnostic during static export/build (no credentials available)
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || process.env.NODE_ENV === 'production') {
    // Check if we're in a build context
    if (typeof window === 'undefined' && !process.env.FIREBASE_SERVICE_ACCOUNT_PATH && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('=== Firebase Diagnostic Check ===\n');
      console.log('⚠️  Skipping diagnostic - running in build/static export mode');
      console.log('   Diagnostics are only available at runtime with service account credentials\n');
      return;
    }
  }

  console.log('=== Firebase Diagnostic Check ===\n');
  
  try {
    // Check 1: Initialize Admin App
    console.log('1. Checking Firebase Admin initialization...');
    const app = getAdminApp();
    console.log('✅ Admin app initialized');
    
    // Check 2: Get Firestore instance
    console.log('\n2. Checking Firestore instance...');
    const db = getFirestore(app);
    console.log('✅ Firestore instance created');
    
    // Check 3: Try a simple read operation
    console.log('\n3. Testing Firestore connection (reading test collection)...');
    try {
      const testRef = db.collection('_test_connection').doc('ping');
      await testRef.get();
      console.log('✅ Firestore connection successful');
    } catch (readError: any) {
      console.log('❌ Firestore connection failed:', readError.message);
      console.log('   Error code:', readError.code);
      if (readError.code === 5) {
        console.log('\n   ⚠️  Error 5 = NOT_FOUND');
        console.log('   This usually means:');
        console.log('   - Firestore database not created yet');
        console.log('   - Firestore API not enabled');
        console.log('   - Wrong project ID');
        console.log('   - Database location mismatch');
      }
    }
    
    // Check 4: Try a simple write operation
    console.log('\n4. Testing Firestore write operation...');
    try {
      const testRef = db.collection('_test_connection').doc('ping');
      await testRef.set({ timestamp: new Date().toISOString(), test: true });
      console.log('✅ Firestore write successful');
      
      // Clean up
      await testRef.delete();
      console.log('✅ Test document cleaned up');
    } catch (writeError: any) {
      console.log('❌ Firestore write failed:', writeError.message);
      console.log('   Error code:', writeError.code);
      console.log('   Full error:', JSON.stringify(writeError, null, 2));
    }
    
    // Check 5: Project info
    console.log('\n5. Project Information:');
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    console.log('   Project ID:', projectId);
    console.log('   Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    
    console.log('\n=== Diagnostic Complete ===\n');
    
  } catch (error: any) {
    console.error('❌ Diagnostic failed:', error.message);
    console.error('   Full error:', error);
  }
}

