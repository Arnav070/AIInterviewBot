'use server';

/**
 * @fileOverview A flow to generate interview questions based on the job position.
 *
 * - generateInterviewQuestions - A function that generates interview questions.
 * - GenerateInterviewQuestionsInput - The input type for the generateInterviewQuestions function.
 * - GenerateInterviewQuestionsOutput - The return type for the generateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {textToSpeech} from './text-to-speech';
import type {InterviewQuestion} from '@/types';

const GenerateInterviewQuestionsInputSchema = z.object({
  jobPosition: z.string().describe('The job position for which to generate interview questions.'),
  cvContent: z.string().describe("The content of the candidate's CV/resume."),
});

export type GenerateInterviewQuestionsInput = z.infer<typeof GenerateInterviewQuestionsInputSchema>;

const GenerateInterviewQuestionsOutputSchema = z.object({
  questions: z
    .array(
      z.object({
        text: z.string().describe('The interview question.'),
        audio: z.string().describe('The base64 encoded audio data for the question.'),
      })
    )
    .describe('An array of interview questions, each with text and audio data.'),
});

export type GenerateInterviewQuestionsOutput = z.infer<typeof GenerateInterviewQuestionsOutputSchema>;

export async function generateInterviewQuestions(input: GenerateInterviewQuestionsInput): Promise<GenerateInterviewQuestionsOutput> {
  return generateInterviewQuestionsFlow(input);
}

const generateInterviewQuestionsPrompt = ai.definePrompt({
  name: 'generateInterviewQuestionsPrompt',
  input: {schema: GenerateInterviewQuestionsInputSchema},
  output: {
    schema: z.object({
      questions: z.array(z.string()).describe('An array of interview questions.'),
    }),
  },
  prompt: `You are an expert interviewer. Generate a list of 5 relevant and challenging interview questions for a candidate applying for the position of {{jobPosition}}. Consider the candidate's CV content when generating the questions.\n\nCV Content: {{{cvContent}}}\n\nQuestions:`,
});

const generateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'generateInterviewQuestionsFlow',
    inputSchema: GenerateInterviewQuestionsInputSchema,
    outputSchema: GenerateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateInterviewQuestionsPrompt(input);
    const questionTexts = output?.questions ?? [];

    const questionsWithAudio = await Promise.all(
      questionTexts.map(async text => {
        const audioData = await textToSpeech(text);
        return {
          text,
          audio: audioData.media,
        };
      })
    );
    
    return {
        questions: questionsWithAudio
    };
  }
);
