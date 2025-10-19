import { NextResponse } from 'next/server';

// Supported form types
type FormType = 'contact' | 'career';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { token, formType } = body;

    // Validate request
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing token' },
        { status: 400 }
      );
    }

    if (!formType || !['contact', 'career'].includes(formType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid form type' },
        { status: 400 }
      );
    }

    // Determine which secret key to use based on form type
    let secretKey: string | undefined;
    if (formType === 'contact') {
      secretKey = process.env.TURNSTILE_CONTACT_SECRET_KEY;
    } else if (formType === 'career') {
      secretKey = process.env.TURNSTILE_CAREER_SECRET_KEY;
    }

    if (!secretKey) {
      console.error(`Missing Turnstile secret key for ${formType} form`);
      return NextResponse.json(
        { success: false, error: 'Configuration error' },
        { status: 500 }
      );
    }

    // Verify with Cloudflare Turnstile
    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const verification = await verificationResponse.json();

    if (!verification.success) {
      console.error('Turnstile verification failed:', verification);
      return NextResponse.json(
        { success: false, error: 'Verification failed', details: verification },
        { status: 400 }
      );
    }

    // Return successful verification
    return NextResponse.json({ success: true, verification });
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
} 