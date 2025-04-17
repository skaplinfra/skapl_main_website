import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, formType } = await request.json();

    const secretKey = formType === 'career' 
      ? process.env.TURNSTILE_CAREER_SECRET_KEY 
      : process.env.TURNSTILE_CONTACT_SECRET_KEY;

    const formData = new URLSearchParams();
    formData.append('secret', secretKey || '');
    formData.append('response', token);

    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: formData,
      }
    );

    const outcome = await result.json();
    return NextResponse.json(outcome);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to verify token' },
      { status: 400 }
    );
  }
} 