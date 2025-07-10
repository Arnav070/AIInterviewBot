'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, Bot, FileUp } from 'lucide-react';
import type { InterviewData } from '@/types';
import { useState } from 'react';

const MAX_FILE_SIZE = 500000;
const ACCEPTED_FILE_TYPES = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const setupSchema = z.object({
  userName: z.string().min(2, 'Name must be at least 2 characters.'),
  userEmail: z.string().email('Please enter a valid email address.'),
  companyEmail: z.string().email('Please enter a valid company email address.'),
  jobPosition: z.string().min(3, 'Job position must be at least 3 characters.'),
  cvFile: z.any()
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file?.type),
      ".pdf, .doc, .docx and .txt files are accepted."
    ).optional(),
});

type SetupFormValues = z.infer<typeof setupSchema>;

interface InterviewSetupProps {
  onSetupComplete: (data: Omit<InterviewData, 'questions' | 'responses' | 'interviewerAvatar'>) => void;
}

export function InterviewSetup({ onSetupComplete }: InterviewSetupProps) {
  const [cvContent, setCvContent] = useState('');

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      userName: '',
      userEmail: '',
      companyEmail: '',
      jobPosition: '',
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        setCvContent(text as string);
      };
      reader.readAsText(file);
    }
  };

  const onSubmit = (values: SetupFormValues) => {
    const { cvFile, ...rest } = values;
    onSetupComplete({...rest, cvContent });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Prepare for Your AI Interview</CardTitle>
        <CardDescription>
          Fill in your details below to begin. Your interview will be tailored based on the job position you provide.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Position</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. hr@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="cvFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload CV (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input type="file" className="pl-10" accept=".pdf,.doc,.docx,.txt" onChange={(e) => {
                            field.onChange(e.target.files?.[0]);
                            handleFileChange(e);
                        }} />
                        <FileUp className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 space-y-4">
                <h3 className="font-medium text-lg">Instructions</h3>
                <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                        <Camera className="w-5 h-5 mt-1 text-primary shrink-0" />
                        <span>Ensure your camera and microphone are enabled and working correctly.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Bot className="w-5 h-5 mt-1 text-primary shrink-0" />
                        <span>The AI will ask you a series of questions. Speak your answer clearly.</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <Mic className="w-5 h-5 mt-1 text-primary shrink-0" />
                        <span>Click 'Start Answering' to begin recording your response and 'Stop' when you're finished.</span>
                    </li>
                </ul>
            </div>

            <Button type="submit" className="w-full text-lg" size="lg">
              Start Interview
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
