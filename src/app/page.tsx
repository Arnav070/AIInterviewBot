'use client';

import { useState, useEffect } from 'react';
import type { InterviewData, InterviewResponse } from '@/types';
import { generateQuestionsAction } from './actions';
import { Logo } from '@/components/icons';
import { InterviewSetup } from '@/components/interview-setup';
import { VideoInterview } from '@/components/video-interview';
import { ResultsPage } from '@/components/results-page';

type InterviewStage = 'setup' | 'interviewing' | 'results' | 'loading' | 'error';

export default function Home() {
  const [stage, setStage] = useState<InterviewStage>('setup');
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSetupComplete = async (data: Omit<InterviewData, 'questions' | 'responses' | 'interviewerAvatar'>) => {
    setStage('loading');
    setError(null);
    try {
      const { questions, interviewerAvatar } = await generateQuestionsAction({
        jobPosition: data.jobPosition,
        cvContent: data.cvContent || '',
      });
      setInterviewData({ ...data, questions, responses: [], interviewerAvatar });
      setStage('interviewing');
    } catch (e) {
      console.error(e);
      setError('Failed to generate interview questions. Please try again.');
      setStage('error');
    }
  };

  const handleInterviewComplete = (responses: InterviewResponse[]) => {
    if (interviewData) {
      setInterviewData({ ...interviewData, responses });
    }
    setStage('results');
  };

  const handleRestart = () => {
    setInterviewData(null);
    setStage('setup');
    setError(null);
  };

  const renderStage = () => {
    switch (stage) {
      case 'setup':
        return <InterviewSetup onSetupComplete={handleSetupComplete} />;
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">Generating your personalized interview questions...</p>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">This may take a moment.</p>
          </div>
        );
      case 'interviewing':
        if (interviewData && isClient) {
          return <VideoInterview interviewData={interviewData} onInterviewComplete={handleInterviewComplete} />;
        }
        return (
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg">Preparing interview environment...</p>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        );
      case 'results':
        if (interviewData) {
          return <ResultsPage interviewData={interviewData} onRestart={handleRestart} />;
        }
        return null;
      case 'error':
        return (
          <div className="text-center">
            <p className="text-destructive font-semibold text-lg">An Error Occurred</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="mb-8 flex items-center gap-3">
          <Logo className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Verbalize AI</h1>
        </header>
        <div className="w-full">{renderStage()}</div>
      </div>
    </main>
  );
}
