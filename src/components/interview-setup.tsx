'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Mic, Bot } from 'lucide-react';
import type { InterviewData } from '@/types';

const setupSchema = z.object({
  userName: z.string().min(2, 'Name must be at least 2 characters.'),
  userEmail: z.string().email('Please enter a valid email address.'),
  jobPosition: z.string().min(3, 'Job position must be at least 3 characters.'),
  cvContent: z.string().optional(),
});

type SetupFormValues = z.infer<typeof setupSchema>;

interface InterviewSetupProps {
  onSetupComplete: (data: Omit<InterviewData, 'questions' | 'responses'>) => void;
}

export function InterviewSetup({ onSetupComplete }: InterviewSetupProps) {
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      userName: '',
      userEmail: '',
      jobPosition: '',
      cvContent: '',
    },
  });

  const onSubmit = (values: SetupFormValues) => {
    onSetupComplete(values);
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
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              name="cvContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CV / Resume Content (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your CV here for more personalized questions."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
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
