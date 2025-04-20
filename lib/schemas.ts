import * as z from 'zod';

// Contact form schema
export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please provide more details'),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
});

// Career form schema
export const CareerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position_applied: z.string().min(1, 'Please select a position'),
  cover_letter: z.string().optional(),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
});

// Form data types
export type ContactFormData = z.infer<typeof ContactFormSchema>;
export type CareerFormData = z.infer<typeof CareerFormSchema>; 