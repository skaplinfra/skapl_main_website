import { NextRequest, NextResponse } from 'next/server';
import { ContactFormData, ContactFormSchema } from '@/lib/schemas';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message || !body.turnstileToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const turnstileSecret = process.env.TURNSTILE_CONTACT_SECRET_KEY;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log('Verifying Turnstile token...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Turnstile secret configured:', !!turnstileSecret);
    console.log('Token received:', !!body.turnstileToken);
    
    if (!turnstileSecret) {
      console.warn('TURNSTILE_CONTACT_SECRET_KEY not configured');
      
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
              response: body.turnstileToken,
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
    const validatedData = ContactFormSchema.parse({
      name: body.name,
      email: body.email,
      phone: body.phone || undefined,
      message: body.message,
      turnstileToken: body.turnstileToken,
    });

    // Save to Firestore
    console.log('Saving contact form to Firestore...');
    console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    try {
      const db = getAdminFirestore();
      console.log('Firestore instance obtained');
      
      const docRef = await db.collection('contact_submissions').add({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || '',
        message: validatedData.message,
        submitted_at: FieldValue.serverTimestamp(),
        created_at: new Date().toISOString(),
      });
      console.log('Contact form saved to Firestore successfully. Document ID:', docRef.id);
    } catch (firestoreError: any) {
      console.error('Firestore save error details:');
      console.error('  Code:', firestoreError.code);
      console.error('  Message:', firestoreError.message);
      console.error('  Details:', firestoreError.details);
      
      if (firestoreError.code === 5 || firestoreError.code === 'NOT_FOUND') {
        throw new Error(
          'Firestore database not found. Please:\n' +
          '1. Go to https://console.firebase.google.com/project/skapl-prod/firestore\n' +
          '2. Make sure Firestore is enabled and database is created\n' +
          '3. Enable Cloud Firestore API: https://console.cloud.google.com/apis/library/firestore.googleapis.com?project=skapl-prod\n' +
          '4. Wait 2-3 minutes for changes to propagate\n' +
          '5. Restart your dev server'
        );
      }
      throw firestoreError;
    }

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process form submission' },
      { status: 500 }
    );
  }
}