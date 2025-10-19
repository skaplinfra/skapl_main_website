// Static version of the careers page for Firebase hosting
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Turnstile } from '@/components/ui/turnstile';
import { submitCareerApplication } from '@/lib/clientApi';
import { CareerFormSchema, CareerFormData } from '@/lib/schemas'; // Import schema and type
import content from '@/CONTENT.json';

type FormData = z.infer<typeof CareerFormSchema>;

export default function CareersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState('');
  const [mounted, setMounted] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(CareerFormSchema),
  });
  const careerContent = content.careers;
  const positions = careerContent.positions;

  // Set the Turnstile site key after the component mounts
  useEffect(() => {
    setMounted(true);
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_CAREER_SITE_KEY || '';
    console.log('Turnstile career site key:', siteKey ? 'Present' : 'Missing');
    setTurnstileSiteKey(siteKey);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      toast.error('Please upload your resume');
      return;
    }

    setIsSubmitting(true);
    try {
      // Using client-side API for static export
      await submitCareerApplication(data as CareerFormData, selectedFile);

      toast.success(careerContent.form.successMessage, {
        duration: 5000,
        style: {
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        },
      });
      reset();
      setSelectedFile(null);
    } catch (error) {
      console.error('Application submission error:', error);
      if (error instanceof Error) {
        toast.error(`Failed to submit application: ${error.message}`, {
          duration: 5000,
        });
      } else {
        toast.error('Failed to submit application. Please try again.', {
          duration: 5000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{careerContent.title}</h1>
          <p className="text-xl text-muted-foreground">
            {careerContent.subtitle}
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                placeholder={careerContent.form.namePlaceholder}
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
                placeholder={careerContent.form.emailPlaceholder}
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
                placeholder={careerContent.form.phonePlaceholder}
                {...register('phone')}
              />
            </div>

            <div>
              <Select onValueChange={(value) => setValue('position_applied', value)}>
                <SelectTrigger className={errors.position_applied ? 'border-destructive' : ''}>
                  <SelectValue placeholder={careerContent.form.positionLabel} />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position_applied && (
                <p className="text-sm text-destructive mt-1">{errors.position_applied.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                {careerContent.form.resumeLabel}
              </label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="w-[200px]"
                >
                  {selectedFile ? 'Change File' : 'Choose File'}
                </Button>
                {selectedFile && (
                  <span className="text-sm text-muted-foreground">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <Textarea
                placeholder={careerContent.form.coverLetterPlaceholder}
                {...register('cover_letter')}
                rows={5}
              />
            </div>

            {mounted && (
              <div className="flex justify-center">
                <Turnstile
                  id="career-form-turnstile"
                  siteKey={turnstileSiteKey}
                  onVerify={(token) => {
                    console.log("Received Turnstile token:", token ? "Present" : "Missing");
                    setValue('turnstileToken', token);
                  }}
                />
              </div>
            )}
            {errors.turnstileToken && (
              <p className="text-sm text-destructive text-center mt-1">{errors.turnstileToken.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : careerContent.form.buttonText}
            </Button>
          </form>
        </Card>

        {/* Open Positions */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="grid gap-6">
            {positions.map((position) => (
              <Card key={position} className="p-6">
                <h3 className="text-xl font-semibold mb-2">{position}</h3>
                <p className="text-muted-foreground mb-4">
                  {careerContent.positionDetails.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{careerContent.positionDetails.type}</span>
                  <span>•</span>
                  <span>{careerContent.positionDetails.location}</span>
                  <span>•</span>
                  <span>{careerContent.positionDetails.remote}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}