import { NextRequest, NextResponse } from 'next/server';
import { appendToSheet, initializeSheet } from '@/lib/google';
import { ContactFormData } from '@/lib/schemas';

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
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('Failed to parse request JSON:', jsonError);
      return sendJsonResponse(
        { error: 'Invalid JSON in request body' },
        400
      );
    }

    // Validate required fields
    if (!body.name || !body.email || !body.message || !body.turnstileToken) {
      return sendJsonResponse(
        { error: 'Missing required fields' },
        400
      );
    }

    // Verify Turnstile token
    const turnstileSecret = process.env.TURNSTILE_CONTACT_SECRET_KEY;
    if (!turnstileSecret) {
      console.error('TURNSTILE_CONTACT_SECRET_KEY not configured');
      return sendJsonResponse(
        { error: 'Server configuration error' },
        500
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

    let turnstileResult;
    try {
      turnstileResult = await turnstileResponse.json();
    } catch (turnstileJsonError) {
      console.error('Failed to parse Turnstile response:', turnstileJsonError);
      return sendJsonResponse(
        { error: 'Failed to verify captcha' },
        500
      );
    }

    if (!turnstileResult.success) {
      return sendJsonResponse(
        { error: 'Security verification failed' },
        403
      );
    }

    // Initialize sheet if needed (only on first run)
    try {
      await initializeSheet();
    } catch (initError) {
      console.error('Failed to initialize sheet:', initError);
      return sendJsonResponse(
        { error: 'Failed to initialize Google Sheet' },
        500
      );
    }

    // Prepare form data
    const formData: ContactFormData = {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      message: body.message,
      turnstileToken: body.turnstileToken,
    };

    // Save to Google Sheet
    try {
      await appendToSheet(formData);
    } catch (sheetError) {
      console.error('Failed to append to sheet:', sheetError);
      return sendJsonResponse(
        { error: 'Failed to save form data' },
        500
      );
    }

    return sendJsonResponse(
      { success: true, message: 'Form submitted successfully' },
      200
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return sendJsonResponse(
      { error: error instanceof Error ? error.message : 'Failed to process form submission' },
      500
    );
  }
}