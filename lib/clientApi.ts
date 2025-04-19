// Client-side API wrapper for static export
import { supabase } from './supabase';

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
  // Verify turnstile
  const isValid = await verifyTurnstileToken(data.turnstileToken, 'contact');
  if (!isValid) {
    throw new Error('Security verification failed');
  }

  // Submit to Supabase
  const { error } = await supabase
    .from('contact_forms')
    .insert([{
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    }]);

  if (error) throw error;
}

// Submit career application directly to Supabase
export async function submitCareerApplication(
  data: CareerFormData, 
  file: File
): Promise<void> {
  // Verify turnstile
  const isValid = await verifyTurnstileToken(data.turnstileToken, 'career');
  if (!isValid) {
    throw new Error('Security verification failed');
  }

  // Upload resume
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${Date.now()}_${data.name.replace(/\s+/g, '_')}.${fileExt}`;
  
  const { error: uploadError, data: fileData } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(fileName);

  // Submit application data
  const { error: submitError } = await supabase
    .from('career_applications')
    .insert([{
      name: data.name,
      email: data.email,
      phone: data.phone,
      position_applied: data.position_applied,
      cover_letter: data.cover_letter,
      resume_url: publicUrl,
      submitted_at: new Date().toISOString(),
    }]);

  if (submitError) throw submitError;
} 