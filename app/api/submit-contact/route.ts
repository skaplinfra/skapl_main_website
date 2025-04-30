import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ContactFormSchema } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    // Parse the request data
    const data = await request.json();
    
    // Validate with zod schema
    const result = ContactFormSchema.safeParse(data);
    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid form data',
        errors: result.error.format()
      }, { status: 400 });
    }
    
    // Extract data from validated result
    const { name, email, phone, message, turnstileToken } = result.data;
    
    // Skip Turnstile verification in development - would be implemented in production
    
    // Store in Supabase
    const { data: insertedData, error } = await supabase
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
      console.error('Supabase insert error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to store message',
        error: error.message
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Message submitted successfully!',
      data: {
        id: insertedData.id,
        created_at: insertedData.created_at
      }
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 