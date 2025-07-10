'use server';

/**
 * @fileOverview A flow to generate an interviewer's avatar.
 *
 * - generateInterviewerAvatar - A function that generates an image for the interviewer.
 * - GenerateInterviewerAvatarInput - The input type for the generateInterviewerAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInterviewerAvatarInputSchema = z.object({
  jobPosition: z.string().describe('The job position the user is applying for, to customize the avatar.'),
});
export type GenerateInterviewerAvatarInput = z.infer<typeof GenerateInterviewerAvatarInputSchema>;

export async function generateInterviewerAvatar(input: GenerateInterviewerAvatarInput): Promise<string> {
  const {media} = await ai.generate({
    model: 'googleai/gemini-2.0-flash-preview-image-generation',
    prompt: `Generate a photorealistic image of a friendly and professional interviewer. They should look appropriate for a corporate interview for a ${input.jobPosition} role. The person should be looking directly at the camera. The background should be a modern, clean office setting.`,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media) {
    throw new Error('Image generation failed.');
  }

  return media.url;
}
