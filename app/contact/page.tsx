// Static version of the contact page for Firebase hosting
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Turnstile } from '@/components/ui/turnstile';
import { submitContactForm } from '@/lib/clientApi';
import { ContactFormData } from '@/lib/schemas';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
});

type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [mounted, setMounted] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Set the Turnstile site key after the component mounts
  useEffect(() => {
    setMounted(true);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_CONTACT_SITE_KEY || '';
    console.log('Turnstile contact site key:', siteKey ? 'Present' : 'Missing');
    setTurnstileSiteKey(siteKey);
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Using client-side API for static export
      await submitContactForm(data as ContactFormData);
      
      toast.success('Message sent successfully!');
      reset();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTurnstileVerify = (token: string) => {
    console.log("Received Turnstile token:", token ? "Present" : "Missing");
    setValue('turnstileToken', token);
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h1 className="text-4xl font-bold mb-8">Get in Touch</h1>
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Input
                    placeholder="Your Name"
                    {...register('name')}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    type="tel"
                    placeholder="Phone Number (Optional)"
                    {...register('phone')}
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Your Message"
                    {...register('message')}
                    className={errors.message ? 'border-destructive' : ''}
                    rows={5}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message.message}</p>
                  )}
                </div>

                {mounted && (
                  <div className="flex justify-center">
                    <Turnstile
                      id="contact-form-turnstile"
                      siteKey={turnstileSiteKey}
                      onVerify={handleTurnstileVerify}
                    />
                  </div>
                )}
                {errors.turnstileToken && (
                  <p className="text-sm text-destructive text-center mt-1">{errors.turnstileToken.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Office</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Address</h3>
                <p className="text-muted-foreground">
                  123 Business Park,<br />
                  Gujarat, India
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p className="text-muted-foreground">
                  Email: contact@skapl.com<br />
                  Phone: +91 123 456 7890
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <p className="text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 1:00 PM
                </p>
              </div>
            </div>

            {/* Map */}
            <div className="mt-8 h-[300px] rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.9014256899257!2d72.5008!3d23.0333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDAyJzAwLjAiTiA3MsKwMzAnMDMuMCJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}