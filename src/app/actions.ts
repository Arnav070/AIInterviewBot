'use server';

import { generateInterviewQuestions, GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { analyzeCandidateResponse, AnalyzeCandidateResponseInput } from '@/ai/flows/analyze-candidate-response';
import { generateInterviewerAvatar } from '@/ai/flows/generate-interview-avatar';
import type { InterviewQuestion } from '@/types';

interface GenerateQuestionsActionResult {
  questions: InterviewQuestion[];
  interviewerAvatar: string;
}

export async function generateQuestionsAction(input: GenerateInterviewQuestionsInput): Promise<GenerateQuestionsActionResult> {
  const [questionsResult, avatarResult] = await Promise.all([
    generateInterviewQuestions(input),
    generateInterviewerAvatar({ jobPosition: input.jobPosition })
  ]);
  
  return {
    questions: questionsResult.questions,
    interviewerAvatar: avatarResult,
  };
}

export async function analyzeResponseAction(input: AnalyzeCandidateResponseInput) {
  const result = await analyzeCandidateResponse(input);
  return result;
}
