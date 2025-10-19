import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet, initializeSheet } from '@/lib/google';
import { ContactFormData } from '@/lib/schemas';

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
    if (!turnstileSecret) {
      console.error('TURNSTILE_CONTACT_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

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

    if (!turnstileResult.success) {
      return NextResponse.json(
        { error: 'Security verification failed' },
        { status: 403 }
      );
    }

    // Initialize sheet if needed (only on first run)
    await initializeSheet();

    // Prepare form data
    const formData: ContactFormData = {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      message: body.message,
      turnstileToken: body.turnstileToken,
    };

    // Save to Google Sheet
    await appendToSheet(formData);

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process form submission' },
      { status: 500 }
    );
  }
}