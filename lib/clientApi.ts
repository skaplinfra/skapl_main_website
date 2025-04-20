// Client-side API wrapper for static export
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

// Form types
export type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  turnstileToken: string;
};

export type CareerFormData = {
  name: string;
  email: string;
  phone?: string;
  position_applied: string;
  cover_letter?: string;
  turnstileToken: string;
};

// Medium post type
export type ClientMediumPost = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  author: string;
  thumbnail: string;
};

// Verify Turnstile token without server API
export async function verifyTurnstileToken(token: string, formType: 'contact' | 'career'): Promise<boolean> {
  try {
    // In production, this would go through your backend
    // For static export, we'll simulate success
    console.log(`Verifying ${formType} form turnstile token: ${token}`);
    
    // Always return success for demo purposes
    return true;
  } catch (error) {
    console.error('Error verifying turnstile token:', error);
    return false;
  }
}

// Submit contact form directly to Supabase
export async function submitContactForm(data: ContactFormData): Promise<void> {
  // First verify the turnstile token
  const verifyResponse = await fetch('/api/verify-turnstile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: data.turnstileToken,
      formType: 'contact'
    }),
  });

  if (!verifyResponse.ok) {
    throw new Error('Failed to verify security token. Please try again.');
  }

  const verifyData = await verifyResponse.json();
  if (!verifyData.success) {
    throw new Error('Security verification failed. Please try again.');
  }

  // Then submit the actual form data
  const { error } = await supabase
    .from('contacts')
    .insert([
      {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
      },
    ]);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error('Failed to submit your message. Please try again later.');
  }
}

// Submit career application directly to Supabase
export async function submitCareerApplication(
  data: CareerFormData, 
  file: File
): Promise<void> {
  // First verify the turnstile token
  const verifyResponse = await fetch('/api/verify-turnstile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: data.turnstileToken,
      formType: 'career'
    }),
  });

  if (!verifyResponse.ok) {
    throw new Error('Failed to verify security token. Please try again.');
  }

  const verifyData = await verifyResponse.json();
  if (!verifyData.success) {
    throw new Error('Security verification failed. Please try again.');
  }

  // Upload resume to Supabase Storage
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${data.name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}.${fileExt}`;
  
  const { data: fileData, error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Resume upload error:', uploadError);
    throw new Error('Failed to upload resume. Please try again.');
  }

  // Get public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);

  const resumeUrl = urlData?.publicUrl;

  // Insert application record
  const { error: insertError } = await supabase
    .from('career_applications')
    .insert([
      {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position_applied: data.position_applied,
        cover_letter: data.cover_letter || null,
        resume_url: resumeUrl,
      },
    ]);

  if (insertError) {
    console.error('Application submission error:', insertError);
    throw new Error('Failed to submit your application. Please try again later.');
  }
}

// Fetch Medium posts
export async function fetchMediumPosts(): Promise<ClientMediumPost[]> {
  try {
    const response = await fetch('/api/medium-posts');
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
} 