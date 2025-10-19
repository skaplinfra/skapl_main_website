import { Storage } from '@google-cloud/storage';
import { readFileSync } from 'fs';

// Initialize Google Cloud Storage
const getStorageClient = () => {
  try {
    const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    if (!keyPath) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_PATH is not set in environment variables');
    }

    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set in environment variables');
    }

    const credentials = JSON.parse(readFileSync(keyPath, 'utf-8'));

    return new Storage({
      projectId,
      credentials,
    });
  } catch (error) {
    console.error('Error initializing Google Cloud Storage:', error);
    throw new Error('Failed to initialize Google Cloud Storage client');
  }
};

// Upload file to Google Cloud Storage
export const uploadToCloudStorage = async (
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  applicantName: string
): Promise<string> => {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    
    if (!bucketName) {
      throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET is not set in environment variables');
    }

    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);

    // Create a unique filename with timestamp and sanitized applicant name
    const sanitizedName = applicantName.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `resumes/${sanitizedName}_${timestamp}.${fileExtension}`;

    // Create a file object
    const file = bucket.file(uniqueFileName);

    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalName: fileName,
          applicantName: applicantName,
          uploadDate: new Date().toISOString(),
        },
      },
    });

    // Generate a signed URL (valid for 7 days - max allowed)
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    console.log('File uploaded to Cloud Storage:', uniqueFileName);
    return signedUrl;
  } catch (error) {
    console.error('Error uploading file to Cloud Storage:', error);
    throw new Error('Failed to upload file to Cloud Storage');
  }
};

// Get public URL for a file (if bucket is public)
export const getPublicUrl = (bucketName: string, fileName: string): string => {
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
};

// Delete a file from Cloud Storage
export const deleteFromCloudStorage = async (fileName: string): Promise<void> => {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    
    if (!bucketName) {
      throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET is not set in environment variables');
    }

    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);
    await bucket.file(fileName).delete();
    
    console.log('File deleted from Cloud Storage:', fileName);
  } catch (error) {
    console.error('Error deleting file from Cloud Storage:', error);
    throw new Error('Failed to delete file from Cloud Storage');
  }
};

// List all files in the resumes folder
export const listResumes = async (): Promise<string[]> => {
  try {
    const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    
    if (!bucketName) {
      throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET is not set');
    }

    const storage = getStorageClient();
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ prefix: 'resumes/' });
    
    return files.map(file => file.name);
  } catch (error) {
    console.error('Error listing resumes:', error);
    throw new Error('Failed to list resumes');
  }
};