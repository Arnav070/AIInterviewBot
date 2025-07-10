'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Webcam from 'react-webcam';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { analyzeResponseAction, textToSpeechAction } from '@/app/actions';
import { Mic, MicOff, Send, Loader2, AlertTriangle, Play } from 'lucide-react';
import type { InterviewData, InterviewResponse, InterviewQuestion } from '@/types';

interface VideoInterviewProps {
  interviewData: InterviewData;
  onInterviewComplete: (responses: InterviewResponse[]) => void;
}

type InterviewStatus = 'waiting' | 'listening' | 'processing' | 'playing' | 'fetching_audio';

export function VideoInterview({ interviewData, onInterviewComplete }: VideoInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<InterviewStatus>('waiting');
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(interviewData.questions);
  const { transcript, isListening, startListening, stopListening, resetTranscript, error: speechError } = useSpeechRecognition();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  
  const playQuestionAudio = useCallback(async () => {
    if (status !== 'waiting') return;

    if (currentQuestion.audio) {
      if (audioRef.current) {
        audioRef.current.src = currentQuestion.audio;
        setStatus('playing');
        audioRef.current.play();
      }
    } else {
      setStatus('fetching_audio');
      try {
        const audioData = await textToSpeechAction(currentQuestion.text);
        const updatedQuestions = [...questions];
        updatedQuestions[currentQuestionIndex].audio = audioData;
        setQuestions(updatedQuestions);
        
        if (audioRef.current) {
            audioRef.current.src = audioData;
            setStatus('playing');
            audioRef.current.play();
        }
      } catch (error) {
          console.error("Failed to fetch audio:", error);
          setStatus('waiting');
      }
    }
  }, [currentQuestion, questions, currentQuestionIndex, status]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        setStatus('waiting');
      };
    }
  }, []);
  
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
        question: currentQuestion.text,
        answer: finalTranscript,
      });

      const newResponse: InterviewResponse = {
        question: currentQuestion.text,
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
        if (currentQuestionIndex < interviewData.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          onInterviewComplete(responses);
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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden shadow-md">
            <Image
                src={interviewData.interviewerAvatar}
                alt="AI Interviewer"
                layout="fill"
                objectFit="cover"
                data-ai-hint="person interviewer"
            />
            <audio ref={audioRef} />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Button
                    size="icon"
                    className="w-16 h-16 rounded-full"
                    onClick={playQuestionAudio}
                    disabled={status !== 'waiting'}
                >
                    {status === 'fetching_audio' ? <Loader2 className="w-8 h-8 animate-spin"/> : <Play className="w-8 h-8"/>}
                </Button>
            </div>
            <div className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-md text-xs">
                {currentQuestion.text}
            </div>
        </div>

        <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden shadow-md">
            <Webcam
            audio={false}
            mirrored={true}
            className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-md text-xs">
                {status === 'listening' ? 'Listening...' : status === 'processing' ? 'Processing...' : 'Ready to Answer'}
            </div>
        </div>
      </div>
      
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
        {(status === 'processing' || status === 'playing' || status === 'fetching_audio') && (
          <Button size="lg" disabled>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {status === 'processing' ? 'Analyzing...' : (status === 'playing' ? 'Playing Question...' : 'Getting Audio...')}
          </Button>
        )}
      </div>
    </div>
  );
}
