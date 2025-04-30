import { NextResponse } from 'next/server';
import { CareerFormSchema } from '@/lib/schemas';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the data against our schema
    const result = CareerFormSchema.safeParse(body);
    if (!result.success) {
      console.error('Career form validation failed:', result.error);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid form data' 
      }, { status: 400 });
    }
    
    const { turnstileToken, ...formData } = result.data;
    
    // Verify the Turnstile token
    const verificationResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_CAREER_SECRET_KEY,
          response: turnstileToken,
        }),
      }
    );
    
    const verification = await verificationResponse.json();
    if (!verification.success) {
      console.error('Turnstile verification failed:', verification);
      return NextResponse.json({ 
        success: false, 
        error: 'Security check failed' 
      }, { status: 400 });
    }
    
    // Store the submission in Supabase
    const { data, error } = await supabase
      .from('career_applications')
      .insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        position_applied: formData.position_applied,
        cover_letter: formData.cover_letter || null,
        // Note: Resume URL would be handled separately with file upload
      })
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to store your application' 
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Application received successfully',
      data: data[0]
    });
    
  } catch (error) {
    console.error('Career form API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error processing your application' 
    }, { status: 500 });
  }
} 