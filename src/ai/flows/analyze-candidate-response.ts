'use server';

/**
 * @fileOverview An AI agent that analyzes candidate responses and provides scores based on their content and delivery.
 *
 * - analyzeCandidateResponse - A function that handles the candidate response analysis process.
 * - AnalyzeCandidateResponseInput - The input type for the analyzeCandidateResponse function.
 * - AnalyzeCandidateResponseOutput - The return type for the analyzeCandidateResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCandidateResponseInputSchema = z.object({
  question: z.string().describe('The interview question asked.'),
  answer: z.string().describe('The candidate\'s answer to the question.'),
});
export type AnalyzeCandidateResponseInput = z.infer<typeof AnalyzeCandidateResponseInputSchema>;

const AnalyzeCandidateResponseOutputSchema = z.object({
  score: z.number().describe('A score representing the quality of the response.'),
  feedback: z.string().describe('Feedback on the candidate\'s response.'),
});
export type AnalyzeCandidateResponseOutput = z.infer<typeof AnalyzeCandidateResponseOutputSchema>;

export async function analyzeCandidateResponse(input: AnalyzeCandidateResponseInput): Promise<AnalyzeCandidateResponseOutput> {
  return analyzeCandidateResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeCandidateResponsePrompt',
  input: {schema: AnalyzeCandidateResponseInputSchema},
  output: {schema: AnalyzeCandidateResponseOutputSchema},
  prompt: `You are an expert interviewer. Analyze the candidate's response to the interview question and provide a score and feedback.

Question: {{{question}}}
Answer: {{{answer}}}

Score (0-100): 
Feedback: `,
});

const analyzeCandidateResponseFlow = ai.defineFlow(
  {
    name: 'analyzeCandidateResponseFlow',
    inputSchema: AnalyzeCandidateResponseInputSchema,
    outputSchema: AnalyzeCandidateResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
