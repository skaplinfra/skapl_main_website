import { NextRequest, NextResponse } from 'next/server';
import { CareerFormSchema } from '@/lib/schemas';
import { uploadToFirebaseStorage } from '@/lib/storage';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
    const turnstileSecret = process.env.TURNSTILE_CAREER_SECRET_KEY;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log('Verifying Turnstile token...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Turnstile secret configured:', !!turnstileSecret);
    console.log('Token received:', !!turnstileToken);
    
    if (!turnstileSecret) {
      console.warn('TURNSTILE_CAREER_SECRET_KEY not configured');
      
      // In development, allow bypass if secret is not configured
      if (isDevelopment) {
        console.warn('Development mode: Bypassing Turnstile verification');
      } else {
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }
    } else {
      // Verify with Cloudflare
      try {
        const turnstileResponse = await fetch(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              secret: turnstileSecret,
              response: turnstileToken,
            }),
          }
        );

        const turnstileResult = await turnstileResponse.json();
        
        console.log('Turnstile verification result:', {
          success: turnstileResult.success,
          'error-codes': turnstileResult['error-codes'],
        });

        if (!turnstileResult.success) {
          console.error('Turnstile verification failed:', turnstileResult);
          
          // In development, show more details
          if (isDevelopment) {
            console.warn('Development mode: Proceeding despite Turnstile failure');
            console.warn('Error codes:', turnstileResult['error-codes']);
          } else {
            return NextResponse.json(
              { error: 'Security verification failed', details: turnstileResult['error-codes'] },
              { status: 403 }
            );
          }
        } else {
          console.log('Turnstile verification successful');
        }
      } catch (verifyError) {
        console.error('Error verifying Turnstile:', verifyError);
        
        if (isDevelopment) {
          console.warn('Development mode: Bypassing Turnstile due to error');
        } else {
          return NextResponse.json(
            { error: 'Security verification error' },
            { status: 500 }
          );
        }
      }
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

    // Upload resume to Firebase Storage
    console.log('Uploading resume to Firebase Storage...');
    const resumeUrl = await uploadToFirebaseStorage(
      resumeBuffer,
      resumeFile.name,
      resumeFile.type,
      name
    );
    console.log('Resume uploaded successfully:', resumeUrl);

    // Save to Firestore
    console.log('Saving career application to Firestore...');
    const db = getAdminFirestore();
    await db.collection('career_applications').add({
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || '',
      position_applied: validatedData.position_applied,
      cover_letter: validatedData.cover_letter || '',
      resume_url: resumeUrl,
      resume_filename: resumeFile.name,
      submitted_at: FieldValue.serverTimestamp(),
      created_at: new Date().toISOString(),
    });
    console.log('Application saved to Firestore successfully');

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