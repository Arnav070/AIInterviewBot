'use server';

import { generateInterviewQuestions, GenerateInterviewQuestionsInput } from '@/ai/flows/generate-interview-questions';
import { analyzeCandidateResponse, AnalyzeCandidateResponseInput } from '@/ai/flows/analyze-candidate-response';

export async function generateQuestionsAction(input: GenerateInterviewQuestionsInput): Promise<string[]> {
  const result = await generateInterviewQuestions(input);
  return result.questions;
}

export async function analyzeResponseAction(input: AnalyzeCandidateResponseInput) {
  const result = await analyzeCandidateResponse(input);
  return result;
}
