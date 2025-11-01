'use server';

/**
 * @fileOverview Provides real-time code suggestions, identifies syntax errors, and suggests best practices.
 *
 * - aiCodeSuggestions - A function that handles the code suggestion process.
 * - AiCodeSuggestionsInput - The input type for the aiCodeSuggestions function.
 * - AiCodeSuggestionsOutput - The return type for the aiCodeSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCodeSuggestionsInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze and provide suggestions for.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type AiCodeSuggestionsInput = z.infer<typeof AiCodeSuggestionsInputSchema>;

const AiCodeSuggestionsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of code suggestions and improvements.'),
  errors: z.array(z.string()).describe('An array of syntax errors found in the code.'),
  bestPractices: z.array(z.string()).describe('An array of best practices to improve code quality and readability.'),
});
export type AiCodeSuggestionsOutput = z.infer<typeof AiCodeSuggestionsOutputSchema>;

export async function aiCodeSuggestions(input: AiCodeSuggestionsInput): Promise<AiCodeSuggestionsOutput> {
  return aiCodeSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeSuggestionsPrompt',
  input: {schema: AiCodeSuggestionsInputSchema},
  output: {schema: AiCodeSuggestionsOutputSchema},
  prompt: `You are an AI Code Assistant that provides real-time code suggestions, identifies syntax errors, and suggests best practices to improve code quality and readability.

  Analyze the following code snippet and provide suggestions, identify errors, and suggest best practices.

  Language: {{{language}}}
  Code: {{{code}}}

  Suggestions:
  - Suggestion 1
  - Suggestion 2

  Errors:
  - Error 1
  - Error 2

  Best Practices:
  - Best Practice 1
  - Best Practice 2`,
});

const aiCodeSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiCodeSuggestionsFlow',
    inputSchema: AiCodeSuggestionsInputSchema,
    outputSchema: AiCodeSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
