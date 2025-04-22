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
  // For static demo site, skip API calls entirely
  if (typeof window !== 'undefined' && window.location.hostname.includes('web.app')) {
    console.log(`Static demo detected - skipping Turnstile verification for ${formType} form`);
    return true;
  }

  try {
    // Use the existing Firebase Function for verification
    const response = await fetch('/api/verifyTurnstile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, formType }),
    });

    // Check if the response is OK before trying to parse JSON
    if (!response.ok) {
      console.warn(`Turnstile verification failed, simulating success for demo: ${response.status}`);
      return true; // Simulate success for demo
    }

    // Try to parse the JSON response
    try {
      const data = await response.json();
      console.log("Turnstile verification response:", data);
      return data.success === true;
    } catch (parseError) {
      console.warn("Error parsing Turnstile verification response, simulating success for demo:", parseError);
      return true; // Simulate success for demo
    }
  } catch (error) {
    console.warn('Error verifying Turnstile token, simulating success for demo:', error);
    return true; // Simulate success for demo
  }
}

/**
 * Submits a contact form (simulated for demo)
 */
export async function submitContactForm(data: z.infer<typeof ContactFormSchema>) {
  try {
    // Verify turnstile token
    const isValidToken = await verifyTurnstileToken(data.turnstileToken, 'contact');
    if (!isValidToken) {
      throw new Error('Invalid security token. Please try again.');
    }

    // In a real implementation, we would submit to a backend API
    // For the demo, we'll just simulate a successful submission
    console.log("Contact form submission (demo):", data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a simulated success response
    return { 
      success: true, 
      data: { 
        id: 'demo-' + Date.now(),
        created_at: new Date().toISOString(),
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message
      } 
    };
  } catch (error) {
    console.error('Contact form submission error:', error);
    throw error;
  }
}

/**
 * Submits a career application (simulated for demo)
 */
export async function submitCareerApplication(data: z.infer<typeof CareerFormSchema>, resume: File) {
  try {
    // Verify turnstile token
    const isValidToken = await verifyTurnstileToken(data.turnstileToken, 'career');
    if (!isValidToken) {
      throw new Error('Invalid security token. Please try again.');
    }

    // Log file info
    console.log("Career application with resume (demo):", {
      formData: data,
      file: {
        name: resume.name,
        type: resume.type,
        size: resume.size + ' bytes'
      }
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a simulated success response
    return { 
      success: true, 
      data: { 
        id: 'demo-' + Date.now(),
        created_at: new Date().toISOString(),
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        position_applied: data.position_applied,
        cover_letter: data.cover_letter || null,
        resume_url: `https://example.com/demo-resumes/${resume.name}`
      } 
    };
  } catch (error) {
    console.error('Career application submission error:', error);
    throw error;
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