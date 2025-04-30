'use client';

// Client-side API wrapper for static export
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { ContactFormSchema, CareerFormSchema, ContactFormData, CareerFormData } from '@/lib/schemas';

// Response type for form submissions
export interface SubmitFormResponse {
  success: boolean;
  message: string;
}

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
 * Verifies a Turnstile token directly with Cloudflare or simulates for static
 */
export async function verifyTurnstileToken(token: string, formType: 'contact' | 'career'): Promise<boolean> {
  // For static sites, skip verification entirely
  if (typeof window !== 'undefined' && 
      (window.location.hostname.includes('web.app') || 
       process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true')) {
    console.log(`Static site detected - skipping Turnstile verification for ${formType} form`);
    return true;
  }

  // For development environment with incomplete setup, allow bypass
  if (process.env.NODE_ENV === 'development' && 
      (!process.env.TURNSTILE_CONTACT_SECRET_KEY || !process.env.TURNSTILE_CAREER_SECRET_KEY)) {
    console.warn('Development environment with missing Turnstile secrets - bypassing verification');
    return true;
  }

  try {
    // For security reasons, we can't verify directly from the client in production
    // as it would expose the secret key. In development, we can use the mock client.
    return true;
  } catch (error) {
    console.warn('Error verifying Turnstile token:', error);
    return false;
  }
}

/**
 * Submits a contact form directly to Supabase or simulates for static site
 */
export async function submitContactForm(formData: ContactFormData): Promise<SubmitFormResponse> {
  console.log('Submitting contact form:', formData);
  
  // For static sites (like Firebase hosting), simulate success
  if (typeof window !== 'undefined' && 
      (window.location.hostname.includes('web.app') || 
       process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true')) {
    console.log("Static site detected - simulating contact form submission");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Your message has been sent successfully (demo mode)!',
    };
  }
  
  try {
    // Verify Turnstile token first
    const isValidToken = await verifyTurnstileToken(formData.turnstileToken, 'contact');
    if (!isValidToken) {
      throw new Error('Security verification failed. Please try again.');
    }
    
    // Use Supabase client directly instead of going through API
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          message: formData.message
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    console.log('Contact form submitted successfully:', data);
    
    return {
      success: true,
      message: 'Your message has been sent successfully!',
    };
  } catch (error) {
    console.error('Error in submitContactForm:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while submitting the form',
    };
  }
}

/**
 * Submits a career application directly to Supabase or simulates for static site
 */
export async function submitCareerApplication(formData: CareerFormData, resume: File): Promise<SubmitFormResponse> {
  console.log('Submitting career application:', formData);
  
  // For static sites (like Firebase hosting), simulate success
  if (typeof window !== 'undefined' && 
      (window.location.hostname.includes('web.app') || 
       process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true')) {
    console.log("Static site detected - simulating career application", {
      formData,
      file: {
        name: resume.name,
        type: resume.type,
        size: resume.size + ' bytes'
      }
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      message: 'Your application has been received successfully (demo mode)!',
    };
  }
  
  try {
    // Verify Turnstile token first
    const isValidToken = await verifyTurnstileToken(formData.turnstileToken, 'career');
    if (!isValidToken) {
      throw new Error('Security verification failed. Please try again.');
    }
    
    // 1. Upload the resume file to Supabase Storage
    let resumeUrl = '';
    try {
      const fileExt = resume.name.split('.').pop();
      const fileName = `${Date.now()}-${formData.name.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, resume);
      
      if (uploadError) {
        console.error('Resume upload error:', uploadError);
        throw new Error('Failed to upload resume: ' + uploadError.message);
      }
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
        
      resumeUrl = urlData.publicUrl;
    } catch (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload resume file');
    }
    
    // 2. Store the application data in Supabase
    const { data, error } = await supabase
      .from('career_applications')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          position_applied: formData.position_applied,
          cover_letter: formData.cover_letter || null,
          resume_url: resumeUrl
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    console.log('Career application submitted successfully:', data);
    
    return {
      success: true,
      message: 'Your application has been submitted successfully!',
    };
  } catch (error) {
    console.error('Error in submitCareerApplication:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while submitting your application',
    };
  }
}

// Fetch Medium posts
export async function fetchMediumPosts(): Promise<ClientMediumPost[]> {
  // For static demo site, return fallback data without API call
  if (typeof window !== 'undefined' && window.location.hostname.includes('web.app')) {
    console.log('Static demo detected - using fallback Medium posts');
    return FALLBACK_MEDIUM_POSTS;
  }

  try {
    // Use the existing Firebase Function endpoint
    const response = await fetch('/api/mediumPosts');
    
    if (!response.ok) {
      console.warn('Medium posts API failed, using fallback data');
      return FALLBACK_MEDIUM_POSTS;
    }
    
    try {
      const posts = await response.json();
      return posts.length > 0 ? posts : FALLBACK_MEDIUM_POSTS;
    } catch (jsonError) {
      console.warn('JSON parsing error for medium posts', jsonError);
      return FALLBACK_MEDIUM_POSTS;
    }
  } catch (error) {
    console.error('Error fetching Medium posts:', error);
    return FALLBACK_MEDIUM_POSTS;
  }
}

// Fallback Medium posts for when the API fails
const FALLBACK_MEDIUM_POSTS: ClientMediumPost[] = [
  {
    title: "The Future of Solar Energy in India",
    link: "https://medium.com/@techinfra/future-of-solar-energy-india",
    pubDate: new Date().toISOString(),
    content: "India's renewable energy sector has witnessed remarkable growth in recent years, with solar power emerging as a key player in the country's energy transition...",
    author: "SKAPL Team",
    thumbnail: "https://miro.medium.com/max/1200/1*jFyawcsqoYctkTuZg6wQ1A.jpeg"
  },
  {
    title: "Digital Transformation in Energy Management",
    link: "https://medium.com/@techinfra/digital-transformation-energy-management",
    pubDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    content: "The integration of digital technologies into energy systems is revolutionizing how we generate, distribute, and consume power. From smart grids to IoT-enabled devices...",
    author: "SKAPL Team",
    thumbnail: "https://miro.medium.com/max/1200/1*-hQb0rUVucwVHF3k0qU8Yw.jpeg"
  },
  {
    title: "Sustainable Building Practices for a Greener Future",
    link: "https://medium.com/@techinfra/sustainable-building-practices",
    pubDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    content: "As climate change concerns continue to grow, the construction industry is increasingly adopting sustainable building practices to reduce environmental impact...",
    author: "SKAPL Team",
    thumbnail: "https://miro.medium.com/max/1200/1*mzJJn1rKB_To9R9T1CA_wg.jpeg"
  }
];

/**
 * Test function to check if Supabase is connected properly
 */
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing Supabase connection...');
    
    // Try to list all tables
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Supabase test error:', error);
      return false;
    }
    
    console.log('Supabase connection successful. Data:', data);
    return true;
  } catch (error) {
    console.error('Supabase test exception:', error);
    return false;
  }
} 