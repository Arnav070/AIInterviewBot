'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast"
import { Star, MessageSquareQuote, CheckCircle, Mail, RefreshCcw } from 'lucide-react';
import type { InterviewData } from '@/types';

interface ResultsPageProps {
  interviewData: InterviewData;
  onRestart: () => void;
}

export function ResultsPage({ interviewData, onRestart }: ResultsPageProps) {
    const { toast } = useToast()

  const overallScore = useMemo(() => {
    if (interviewData.responses.length === 0) return 0;
    const total = interviewData.responses.reduce((sum, res) => sum + res.score, 0);
    return Math.round(total / interviewData.responses.length);
  }, [interviewData.responses]);
  
  const handleEmailResults = () => {
    toast({
        title: "Results Sent!",
        description: `Your interview results have been sent to ${interviewData.userEmail}.`,
        action: <CheckCircle className="text-green-500" />,
    })
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <Card className="shadow-lg text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Interview Complete, {interviewData.userName}!</CardTitle>
          <CardDescription>Here is a summary of your performance for the {interviewData.jobPosition} position.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-secondary"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="text-primary"
                strokeDasharray={`${overallScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{overallScore}</span>
                <span className="text-sm text-muted-foreground">Overall Score</span>
            </div>
          </div>
          <p className="max-w-prose text-muted-foreground">
            This score reflects the analysis of your responses based on clarity, relevance, and content.
          </p>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleEmailResults}><Mail className="mr-2 h-4 w-4" /> Email My Results</Button>
            <Button onClick={onRestart} variant="outline"><RefreshCcw className="mr-2 h-4 w-4" /> Start Over</Button>
        </CardFooter>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Detailed Breakdown</h2>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {interviewData.responses.map((response, index) => (
            <AccordionItem value={`item-${index}`} key={index} className="bg-card border-b-0 rounded-lg mb-3 shadow-md">
              <AccordionTrigger className="p-4 hover:no-underline">
                <div className="flex justify-between items-center w-full">
                    <span className="text-left font-medium text-foreground pr-4">
                        Question {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-base py-1 px-3">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" /> {response.score} / 100
                        </Badge>
                    </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                    <p className="font-semibold text-muted-foreground">{response.question}</p>
                    
                    <div className="bg-secondary/50 p-4 rounded-md">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                           <MessageSquareQuote className="w-5 h-5 text-primary" /> Your Answer
                        </h4>
                        <p className="text-muted-foreground italic">"{response.answer}"</p>
                    </div>

                    <div className="bg-secondary/50 p-4 rounded-md">
                        <h4 className="font-semibold flex items-center gap-2 mb-2">
                           <CheckCircle className="w-5 h-5 text-primary" /> AI Feedback
                        </h4>
                        <p className="text-muted-foreground">{response.feedback}</p>
                    </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
