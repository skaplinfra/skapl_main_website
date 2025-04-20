'use client';

// Client-side API wrapper for static export
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { ContactFormSchema, CareerFormSchema, ContactFormData, CareerFormData } from '@/lib/schemas';

// Medium post type
export type ClientMediumPost = {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  author: string;
  thumbnail: string;
};

/**
 * Verifies a Turnstile token with the server
 */
export async function verifyTurnstileToken(token: string, formType: 'contact' | 'career'): Promise<boolean> {
  try {
    // Determine API endpoint based on environment
    const apiEndpoint = window.location.origin.includes('localhost') 
      ? '/api/verify-turnstile' 
      : '/api/verify-turnstile';
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, formType }),
    });

    // Check if the response is OK before trying to parse JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Turnstile verification failed with status ${response.status}: ${errorText}`);
      return false;
    }

    // Try to parse the JSON response
    try {
      const data = await response.json();
      console.log("Turnstile verification response:", data);
      return data.success === true;
    } catch (parseError) {
      console.error("Error parsing Turnstile verification response:", parseError);
      console.log("Response that couldn't be parsed:", await response.text());
      return false;
    }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    
    // For demo/static builds, just simulate success
    if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'skapl.com') {
      console.warn('Static deployment detected - simulating Turnstile success');
      return true;
    }
    
    return false;
  }
}

/**
 * Submits a contact form to the Supabase database
 */
export async function submitContactForm(data: z.infer<typeof ContactFormSchema>) {
  try {
    // Verify turnstile token
    const isValidToken = await verifyTurnstileToken(data.turnstileToken, 'contact');
    if (!isValidToken) {
      throw new Error('Invalid security token. Please try again.');
    }

    // If we're in dev, use the Supabase client directly via an API route
    if (window.location.hostname === 'localhost') {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      try {
        return await response.json();
      } catch (parseError) {
        console.error("Error parsing contact form response:", parseError);
        throw new Error("The server returned an invalid response. Please try again later.");
      }
    } else {
      // For static/demo deployments, use client-side Supabase
      const { data: formData, error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            message: data.message,
          },
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase contact form submission error:', error);
        
        // For demo/static builds, just simulate success
        if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'skapl.com') {
          console.warn('Static deployment detected - simulating form submission success');
          return { success: true, data: { id: 'mock-id-' + Date.now() } };
        }
        
        throw new Error('Failed to submit your message. Please try again later.');
      }
      
      return { success: true, data: formData };
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    throw error;
  }
}

/**
 * Submits a career application to the Supabase database and uploads the resume
 */
export async function submitCareerApplication(data: z.infer<typeof CareerFormSchema>, resume: File) {
  try {
    // Verify turnstile token
    const isValidToken = await verifyTurnstileToken(data.turnstileToken, 'career');
    if (!isValidToken) {
      throw new Error('Invalid security token. Please try again.');
    }

    // If we're in dev, use the Supabase client directly via an API route
    if (window.location.hostname === 'localhost') {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone || '');
      formData.append('position', data.position_applied);
      formData.append('coverLetter', data.cover_letter || '');
      formData.append('resume', resume);
      formData.append('token', data.turnstileToken);
      
      const response = await fetch('/api/careers', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      try {
        return await response.json();
      } catch (parseError) {
        console.error("Error parsing career form response:", parseError);
        throw new Error("The server returned an invalid response. Please try again later.");
      }
    } else {
      // For static/demo deployments, handle file upload and form submission client-side
      
      // 1. Upload resume file to Supabase storage
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExt = resume.name.split('.').pop();
      const filePath = `${data.name.replace(/\s+/g, '-')}-${timestamp}.${fileExt}`;
      
      console.log('Uploading resume:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resume);
      
      if (uploadError) {
        console.error('Resume upload error:', uploadError);
        
        // For demo/static builds, just simulate success
        if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'skapl.com') {
          console.warn('Static deployment detected - simulating career application success');
          return { success: true, data: { id: 'mock-id-' + Date.now() } };
        }
        
        throw new Error('Failed to upload your resume. Please try again.');
      }
      
      // 2. Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(uploadData.path);
      
      // 3. Submit the application to the database
      const { data: applicationData, error: submitError } = await supabase
        .from('career_applications')
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            position_applied: data.position_applied,
            cover_letter: data.cover_letter || null,
            resume_url: urlData.publicUrl,
          },
        ])
        .select()
        .single();
      
      if (submitError) {
        console.error('Career application submission error:', submitError);
        
        // For demo/static builds, just simulate success
        if (process.env.NODE_ENV === 'production' && window.location.hostname !== 'skapl.com') {
          console.warn('Static deployment detected - simulating career application success');
          return { success: true, data: { id: 'mock-id-' + Date.now() } };
        }
        
        throw new Error('Failed to submit your application. Please try again later.');
      }
      
      return { success: true, data: applicationData };
    }
  } catch (error) {
    console.error('Career application submission error:', error);
    throw error;
  }
}

// Fetch Medium posts
export async function fetchMediumPosts(): Promise<ClientMediumPost[]> {
  try {
    // Note: Firebase rewrites are configured for /api/mediumPosts (no dash)
    const response = await fetch('/api/mediumPosts');
    
    if (!response.ok) {
      console.warn('Medium posts API failed, using fallback data');
      return [];
    }
    
    try {
      return await response.json();
    } catch (jsonError) {
      console.warn('JSON parsing error for medium posts', jsonError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return [];
  }
} 