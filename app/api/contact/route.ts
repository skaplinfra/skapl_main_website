import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ContactFormSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json();
    
    // Validate the form data
    const result = ContactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, phone, message, turnstileToken } = result.data;
    
    // Verify Turnstile token
    const verifyURL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_CONTACT_SECRET_KEY || '');
    formData.append('response', turnstileToken);
    
    const verifyResponse = await fetch(verifyURL, {
      method: 'POST',
      body: formData,
    });
    
    const verifyData = await verifyResponse.json();
    
    if (!verifyData.success) {
      console.error('Turnstile verification failed:', verifyData);
      return NextResponse.json(
        { error: 'Security verification failed' },
        { status: 400 }
      );
    }
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          message
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }
    
    // Log the successful submission
    console.log('Contact form submitted successfully:', data);
    
    return NextResponse.json({ success: true, data });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
} 