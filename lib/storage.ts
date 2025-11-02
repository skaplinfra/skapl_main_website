import { getAdminStorage, getAdminApp } from './firebase-admin';

// Upload file to Firebase Storage using Admin SDK (server-side)
export const uploadToFirebaseStorage = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  applicantName: string
): Promise<string> => {
  // Define these outside try block so they're accessible in catch
  const app = getAdminApp();
  const projectId = app.options.projectId || 'skapl-prod';
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                    `${projectId}.firebasestorage.app` ||
                    `${projectId}.appspot.com`;
  
  try {
    console.log('Starting file upload to Firebase Storage...');
    console.log('File name:', fileName);
    console.log('File size:', buffer.length, 'bytes');
    console.log('MIME type:', mimeType);
    
    // Create a unique filename with timestamp and sanitized applicant name
    const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `resumes/${sanitizedName}_${timestamp}.${fileExtension}`;

    console.log('Unique filename:', uniqueFileName);

    // Get the storage bucket
    const storage = getAdminStorage();
    
    console.log('Attempting to use bucket:', bucketName);
    
    // Get the bucket explicitly
    let bucket = storage.bucket(bucketName);
    
    console.log('Bucket name:', bucket.name);
    
    // Verify bucket exists by trying to get its metadata
    try {
      console.log('Verifying bucket exists...');
      const [exists] = await bucket.exists();
      if (!exists) {
        throw new Error(`Bucket ${bucketName} does not exist. Please enable Storage in Firebase Console.`);
      }
      console.log('Bucket verified successfully');
    } catch (verifyError: any) {
      console.error('Bucket verification failed:', verifyError.message);
      if (verifyError.code === 404 || verifyError.code === 'notFound') {
        throw new Error(
          `Storage bucket "${bucketName}" not found. Please:\n` +
          `1. Go to https://console.firebase.google.com/project/${projectId}/storage\n` +
          `2. Click "Get started" to enable Storage\n` +
          `3. Wait 30-60 seconds for bucket to be created\n` +
          `4. Verify bucket name matches: ${bucketName}`
        );
      }
      throw verifyError;
    }
    
    // Create a file reference
    const file = bucket.file(uniqueFileName);

    console.log('Uploading file...');
    // Upload the file (without public ACL - bucket uses uniform access)
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalName: fileName,
          applicantName: applicantName,
          uploadDate: new Date().toISOString(),
        },
      },
      // Don't set public: true when uniform bucket-level access is enabled
      // Files will be accessible via signed URLs or bucket-level permissions
    });

    console.log('File uploaded successfully');
    
    // Generate a signed URL (valid for 1 year)
    // This works with uniform bucket-level access
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });
    
    console.log('Signed URL generated');
    
    // Use signed URL instead of public URL
    const publicUrl = signedUrl;
    
    console.log('File uploaded to Firebase Storage:', publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error('=== Detailed Storage Upload Error ===');
    console.error('Error type:', error?.constructor?.name || typeof error);
    
    // Handle different error formats
    if (error?.error) {
      // Google API error format
      console.error('Error code:', error.error?.code);
      console.error('Error message:', error.error?.message);
      console.error('Error details:', JSON.stringify(error.error, null, 2));
      
      if (error.error?.code === 404 || error.error?.code === 'notFound') {
        throw new Error(
          `Storage bucket not found: ${bucketName}. Please:\n` +
          `1. Go to https://console.firebase.google.com/project/${projectId}/storage\n` +
          `2. Make sure Storage is enabled\n` +
          `3. Check the actual bucket name in Storage settings\n` +
          `4. Set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in .env.local to match`
        );
      }
      
      throw new Error(`Failed to upload file: ${error.error?.message || 'Unknown error'}`);
    }
    
    if (error?.code) {
      // Direct error code
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      if (error.code === 404 || error.code === 'notFound') {
        throw new Error(
          `Storage bucket not found: ${bucketName}. Please enable Storage at:\n` +
          `https://console.firebase.google.com/project/${projectId}/storage`
        );
      }
      
      throw new Error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    }
    
    // Generic error
    console.error('Error message:', error?.message || String(error));
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error?.stack || 'No stack trace');
    
    if (error instanceof Error) {
      throw new Error(`Failed to upload file to Firebase Storage: ${error.message}`);
    }
    
    throw new Error(`Failed to upload file to Firebase Storage: ${JSON.stringify(error)}`);
  }
};

// For backwards compatibility, export as the old name
export const uploadToCloudStorage = uploadToFirebaseStorage;