import { NextRequest, NextResponse } from 'next/server';
import { CareerFormSchema } from '@/lib/schemas';
import { submitToGoogleSheets, verifyTurnstile, initializeSheet } from '@/lib/sheets';
import { uploadToCloudStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  // Ensure we always return JSON responses
  const sendJsonResponse = (data: any, status: number = 200) => {
    return new NextResponse(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  };

  try {
    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch (formError) {
      console.error('Failed to parse form data:', formError);
      return sendJsonResponse(
        { error: 'Invalid form data received' },
        400
      );
    }
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string | null;
    const position_applied = formData.get('position_applied') as string;
    const cover_letter = formData.get('cover_letter') as string | null;
    const turnstileToken = formData.get('turnstileToken') as string;
    const resumeFile = formData.get('resume') as File;

    // Validate required fields
    if (!name || !email || !position_applied || !turnstileToken || !resumeFile) {
      return sendJsonResponse(
        { error: 'Missing required fields' },
        400
      );
    }

    // Verify Turnstile token
    try {
      const isValidToken = await verifyTurnstile(turnstileToken);
      if (!isValidToken) {
        return sendJsonResponse(
          { error: 'Invalid captcha verification' },
          400
        );
      }
    } catch (turnstileError) {
      console.error('Turnstile verification error:', turnstileError);
      return sendJsonResponse(
        { error: 'Failed to verify captcha' },
        500
      );
    }

    // Validate form data with Zod schema
    let validatedData;
    try {
      validatedData = CareerFormSchema.parse({
        name,
        email,
        phone: phone || undefined,
        position_applied,
        cover_letter: cover_letter || undefined,
        turnstileToken,
      });
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return sendJsonResponse(
        { error: 'Invalid form data provided' },
        400
      );
    }

    // Validate file
    if (resumeFile.size > 5 * 1024 * 1024) {
      return sendJsonResponse(
        { error: 'File size must be less than 5MB' },
        400
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(resumeFile.type)) {
      return sendJsonResponse(
        { error: 'Only PDF and DOC files are allowed' },
        400
      );
    }

    // Convert file to buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const resumeBuffer = Buffer.from(arrayBuffer);

    // Upload resume to Google Cloud Storage
    console.log('Uploading resume to Cloud Storage...');
    let resumeUrl;
    try {
      resumeUrl = await uploadToCloudStorage(
        resumeBuffer,
        resumeFile.name,
        resumeFile.type,
        name
      );
      console.log('Resume uploaded successfully:', resumeUrl);
    } catch (uploadError) {
      console.error('Failed to upload resume:', uploadError);
      return sendJsonResponse(
        { error: 'Failed to upload resume file' },
        500
      );
    }

    // Initialize sheet if needed (first time setup)
    try {
      await initializeSheet();
    } catch (initError) {
      console.error('Failed to initialize sheet:', initError);
      return sendJsonResponse(
        { error: 'Failed to initialize Google Sheet' },
        500
      );
    }

    // Submit to Google Sheets
    console.log('Submitting to Google Sheets...');
    try {
      await submitToGoogleSheets(validatedData, resumeUrl);
      console.log('Sheet submission successful');
    } catch (sheetError) {
      console.error('Failed to submit to Google Sheets:', sheetError);
      return sendJsonResponse(
        { error: 'Failed to submit application to Google Sheets' },
        500
      );
    }

    return sendJsonResponse({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error processing career application:', error);
    
    if (error instanceof Error) {
      return sendJsonResponse(
        { error: error.message },
        500
      );
    }
    
    return sendJsonResponse(
      { error: 'Failed to submit application' },
      500
    );
  }
}