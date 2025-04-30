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
import content from '@/CONTENT.json';

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
  const contactContent = content.contact;

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
      
      toast.success(contactContent.form.successMessage);
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
            <h1 className="text-4xl font-bold mb-8">{contactContent.title}</h1>
            <Card className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Input
                    placeholder={contactContent.form.namePlaceholder}
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
                    placeholder={contactContent.form.emailPlaceholder}
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
                    placeholder={contactContent.form.phonePlaceholder}
                    {...register('phone')}
                  />
                </div>

                <div>
                  <Textarea
                    placeholder={contactContent.form.messagePlaceholder}
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
                  {isSubmitting ? 'Sending...' : contactContent.form.buttonText}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Office</h2>
            <div className="space-y-6">
              {contactContent.info.sections.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-2">{section.title}</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="mt-8 h-[300px] rounded-lg overflow-hidden">
              <iframe
                src={contactContent.info.mapUrl}
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