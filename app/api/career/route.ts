import { NextRequest, NextResponse } from 'next/server';
import { CareerFormSchema } from '@/lib/schemas';
import { submitToGoogleSheets, verifyTurnstile, initializeSheet } from '@/lib/sheets';
import { uploadToCloudStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string | null;
    const position_applied = formData.get('position_applied') as string;
    const cover_letter = formData.get('cover_letter') as string | null;
    const turnstileToken = formData.get('turnstileToken') as string;
    const resumeFile = formData.get('resume') as File;

    // Validate required fields
    if (!name || !email || !position_applied || !turnstileToken || !resumeFile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const isValidToken = await verifyTurnstile(turnstileToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'Invalid captcha verification' },
        { status: 400 }
      );
    }

    // Validate form data with Zod schema
    const validatedData = CareerFormSchema.parse({
      name,
      email,
      phone: phone || undefined,
      position_applied,
      cover_letter: cover_letter || undefined,
      turnstileToken,
    });

    // Validate file
    if (resumeFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(resumeFile.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOC files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const resumeBuffer = Buffer.from(arrayBuffer);

    // Upload resume to Google Cloud Storage
    console.log('Uploading resume to Cloud Storage...');
    const resumeUrl = await uploadToCloudStorage(
      resumeBuffer,
      resumeFile.name,
      resumeFile.type,
      name
    );
    console.log('Resume uploaded successfully:', resumeUrl);

    // Initialize sheet if needed (first time setup)
    await initializeSheet();

    // Submit to Google Sheets
    console.log('Submitting to Google Sheets...');
    await submitToGoogleSheets(validatedData, resumeUrl);
    console.log('Sheet submission successful');

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error processing career application:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}