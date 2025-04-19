// Static version of the careers page for Firebase hosting
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Turnstile } from '@/components/ui/turnstile';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position_applied: z.string().min(1, 'Please select a position'),
  cover_letter: z.string().optional(),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
});

type FormData = z.infer<typeof formSchema>;

const positions = [
  'Software Engineer',
  'Senior Cloud Architect',
  'Site Reliability Engineer (Devops)',
  'DevOps Engineer',
  'Project Manager',
  'Solar Energy Consultant',
  'Business Analyst',
  'Operations Manager',
  'Sales Manager',
  'Marketing Manager',
  'HR Manager',
  'Customer Support',
  'Data Analyst',
  'Content Writer',
  'Intern - SDE',
  'Intern - Sales & Marketing',
  'Intern - Finance',
  'Intern - Operations',
  'Intern - Business Development',
  'Intern - Customer Success',
];

export default function CareersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      toast.error('Please upload your resume');
      return;
    }

    setIsSubmitting(true);
    try {
      // Verify the turnstile token server-side
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

      const verifyData = await verifyResponse.json();
      if (!verifyData.success) {
        throw new Error('Security check failed. Please try again.');
      }

      // Log the file details
      console.log('File details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });

      // First, check if the 'resumes' bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error fetching buckets:', bucketsError);
        toast.error('Failed to check storage configuration');
        return;
      }

      console.log('Available buckets:', buckets?.map(b => b.name));
      
      // Attempt direct upload without bucket check
      console.log('Attempting file upload...');
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}_${data.name.replace(/\s+/g, '_')}.${fileExt}`;
      
      const { error: uploadError, data: fileData } = await supabase.storage
        .from('resumes')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', {
          message: uploadError.message,
          name: uploadError.name
        });
        throw uploadError;
      }

      console.log('File uploaded successfully:');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      // Submit application data
      const applicationData = {
        ...data,
        resume_url: publicUrl,
        submitted_at: new Date().toISOString(),
      };
      
      const { error: submitError, data: submittedData } = await supabase
        .from('career_applications')
        .insert([applicationData])
        .select()
        .single();

      if (submitError) {
        console.error('Application submission error:', {
          message: submitError.message,
          code: submitError.code,
          details: submitError.details,
          hint: submitError.hint
        });
        throw submitError;
      }

      toast.success('Application received! We\'ll reach out to you soon.', {
        duration: 5000,
        style: {
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
        },
      });
      reset();
      setSelectedFile(null);
    } catch (error) {
      console.error('Full error details:', error);
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
          <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-muted-foreground">
            Be part of our mission to build sustainable futures through innovative energy solutions.
          </p>
        </div>

        <Card className="p-8">
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
              <Select onValueChange={(value) => setValue('position_applied', value)}>
                <SelectTrigger className={errors.position_applied ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select Position" />
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
                Upload Resume (PDF, DOC, DOCX - Max 5MB)
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
                placeholder="Cover Letter (Optional)"
                {...register('cover_letter')}
                rows={5}
              />
            </div>

            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_CAREER_SITE_KEY || ''}
                onVerify={(token) => setValue('turnstileToken', token)}
              />
            </div>
            {errors.turnstileToken && (
              <p className="text-sm text-destructive text-center mt-1">{errors.turnstileToken.message}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
                  We're looking for talented individuals to join our team and help shape the future of sustainable energy.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Full Time</span>
                  <span>•</span>
                  <span>Gujarat, India</span>
                  <span>•</span>
                  <span>Remote Friendly</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}