"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import type { AiCodeSuggestionsOutput } from "@/ai/flows/ai-code-suggestions";
import { Lightbulb, Bug, Sparkles } from "lucide-react";

type AiAssistantProps = {
  suggestions: AiCodeSuggestionsOutput | null;
  isRunning: boolean;
};

const LoadingState = () => (
  <div className="space-y-4 p-2">
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-5/6" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
    </div>
  </div>
);

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Bot className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">AI Assistant</h3>
        <p className="text-muted-foreground">
            Start typing your code (at least 20 characters) and I'll provide suggestions, find errors, and suggest best practices.
        </p>
    </div>
)

export default function AiAssistant({ suggestions, isRunning }: AiAssistantProps) {
  if (isRunning) {
    return <LoadingState />;
  }

  if (!suggestions || (!suggestions.suggestions.length && !suggestions.errors.length && !suggestions.bestPractices.length)) {
    return <EmptyState />;
  }

  return (
    <Accordion type="multiple" defaultValue={["suggestions", "errors", "best-practices"]} className="w-full">
      {suggestions.suggestions.length > 0 && (
        <AccordionItem value="suggestions">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Suggestions
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2 pl-6 text-sm">
              {suggestions.suggestions.map((s, i) => (
                <li key={`sug-${i}`}>{s}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {suggestions.errors.length > 0 && (
        <AccordionItem value="errors">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Errors
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2 pl-6 text-sm">
              {suggestions.errors.map((e, i) => (
                <li key={`err-${i}`}>{e}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}

      {suggestions.bestPractices.length > 0 && (
        <AccordionItem value="best-practices">
          <AccordionTrigger className="text-base font-medium hover:no-underline">
            <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-400" />
                Best Practices
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2 pl-6 text-sm">
              {suggestions.bestPractices.map((bp, i) => (
                <li key={`bp-${i}`}>{bp}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}
