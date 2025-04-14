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

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position_applied: z.string().min(1, 'Please select a position'),
  cover_letter: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const positions = [
  'Software Engineer',
  'Project Manager',
  'Solar Energy Consultant',
  'Business Analyst',
  'Operations Manager',
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

      console.log('File uploaded successfully:', fileData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      console.log('Generated public URL:', publicUrl);

      // Submit application data
      const applicationData = {
        ...data,
        resume_url: publicUrl,
        submitted_at: new Date().toISOString(),
      };

      console.log('Submitting application data:', applicationData);
      
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

      console.log('Application submitted successfully:', submittedData);
      toast.success('Application submitted successfully!');
      reset();
      setSelectedFile(null);
    } catch (error) {
      console.error('Full error details:', error);
      if (error instanceof Error) {
        toast.error(`Failed to submit application: ${error.message}`);
      } else {
        toast.error('Failed to submit application. Please try again.');
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

            <div>
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload your resume (PDF, DOC, DOCX - Max 5MB)
              </p>
            </div>

            <div>
              <Textarea
                placeholder="Cover Letter (Optional)"
                {...register('cover_letter')}
                rows={5}
              />
            </div>

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