'use client';

import { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analyzeResponseAction } from '@/app/actions';
import { Mic, MicOff, Bot, Send, Loader2, AlertTriangle } from 'lucide-react';
import type { InterviewData, InterviewResponse } from '@/types';

interface VideoInterviewProps {
  interviewData: InterviewData;
  onInterviewComplete: (responses: InterviewResponse[]) => void;
}

type InterviewStatus = 'waiting' | 'listening' | 'processing';

export function VideoInterview({ interviewData, onInterviewComplete }: VideoInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<InterviewStatus>('waiting');
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const { transcript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition();
  
  const currentQuestion = interviewData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / interviewData.questions.length) * 100;
  
  const handleStartRecording = () => {
    resetTranscript();
    startListening();
    setStatus('listening');
  };

  const handleStopRecording = async () => {
    stopListening();
    setStatus('processing');

    const finalTranscript = transcript.trim();
    
    try {
      const analysis = await analyzeResponseAction({
        question: currentQuestion,
        answer: finalTranscript,
      });

      const newResponse: InterviewResponse = {
        question: currentQuestion,
        answer: finalTranscript,
        score: analysis.score,
        feedback: analysis.feedback,
      };
      
      const updatedResponses = [...responses, newResponse];
      setResponses(updatedResponses);

      if (currentQuestionIndex < interviewData.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        resetTranscript();
        setStatus('waiting');
      } else {
        onInterviewComplete(updatedResponses);
      }
    } catch (error) {
        console.error("Failed to analyze response:", error);
        // For simplicity, we'll move on. A real app might offer a retry.
        if (currentQuestionIndex < interviewData.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          onInterviewComplete(responses); // complete with what we have
        }
        setStatus('waiting');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
             <CardTitle>Interview Progress</CardTitle>
             <span className="text-sm font-medium text-muted-foreground">
                Question {currentQuestionIndex + 1} of {interviewData.questions.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
        </CardContent>
      </Card>

      <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden shadow-md">
        <Webcam
          audio={false}
          mirrored={true}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded-md text-sm">
            {isListening ? 'Listening...' : 'Ready'}
        </div>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <Bot className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Question:</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-foreground font-medium">{currentQuestion}</p>
        </CardContent>
      </Card>

      {transcript && status === 'listening' && (
        <Card className="bg-background/70 backdrop-blur-sm">
          <CardHeader><CardTitle className="text-lg">Your Answer:</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground italic">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {speechError && (
          <div className="flex items-center gap-2 text-destructive p-3 bg-destructive/10 rounded-md">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">{speechError}</p>
          </div>
      )}
      
      <div className="flex justify-center mt-4">
        {status === 'waiting' && (
          <Button size="lg" onClick={handleStartRecording} disabled={!!speechError}>
            <Mic className="mr-2 h-5 w-5" />
            Start Answering
          </Button>
        )}
        {status === 'listening' && (
          <Button size="lg" onClick={handleStopRecording} variant="destructive">
            <MicOff className="mr-2 h-5 w-5" />
            Stop & Submit Answer
          </Button>
        )}
        {status === 'processing' && (
          <Button size="lg" disabled>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Analyzing...
          </Button>
        )}
      </div>
    </div>
  );
}
