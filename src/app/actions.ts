
'use server';

import { 
  aiCodeSuggestions,
  type AiCodeSuggestionsInput,
  type AiCodeSuggestionsOutput,
} from '@/ai/flows/ai-code-suggestions';

export async function getAiSuggestions(
  input: AiCodeSuggestionsInput
): Promise<AiCodeSuggestionsOutput> {
  try {
    const result = await aiCodeSuggestions(input);
    return result;
  } catch (error) {
    console.error("AI suggestion failed:", error);
    return { 
      suggestions: [], 
      errors: ["An error occurred while fetching AI suggestions. Please try again."], 
      bestPractices: [] 
    };
  }
}
