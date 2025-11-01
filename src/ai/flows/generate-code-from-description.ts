'use server';
/**
 * @fileOverview An AI agent that generates code snippets from a user description.
 *
 * - generateCodeFromDescription - A function that generates a code snippet based on the description provided.
 * - GenerateCodeFromDescriptionInput - The input type for the generateCodeFromDescription function.
 * - GenerateCodeFromDescriptionOutput - The return type for the generateCodeFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeFromDescriptionInputSchema = z.object({
  description: z
    .string()
    .describe('A description of the code snippet to generate.'),
  language: z.string().describe('The programming language for the code snippet.'),
});
export type GenerateCodeFromDescriptionInput = z.infer<
  typeof GenerateCodeFromDescriptionInputSchema
>;

const GenerateCodeFromDescriptionOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeFromDescriptionOutput = z.infer<
  typeof GenerateCodeFromDescriptionOutputSchema
>;

export async function generateCodeFromDescription(
  input: GenerateCodeFromDescriptionInput
): Promise<GenerateCodeFromDescriptionOutput> {
  return generateCodeFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCodeFromDescriptionPrompt',
  input: {schema: GenerateCodeFromDescriptionInputSchema},
  output: {schema: GenerateCodeFromDescriptionOutputSchema},
  prompt: `You are an expert software engineer. Please generate a code snippet that fulfills the following description in the specified language.\n\nDescription: {{{description}}}\nLanguage: {{{language}}}\n\nCode:`,
});

const generateCodeFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCodeFromDescriptionFlow',
    inputSchema: GenerateCodeFromDescriptionInputSchema,
    outputSchema: GenerateCodeFromDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
