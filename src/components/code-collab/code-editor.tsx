"use client";

import { useEffect, useRef, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { getAiSuggestions } from "@/app/actions";
import type { AiCodeSuggestionsOutput } from "@/ai/flows/ai-code-suggestions";

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
  language: string;
  onAiSuggestionsUpdate: (suggestions: AiCodeSuggestionsOutput | null) => void;
  onIsAiRunningUpdate: (isRunning: boolean) => void;
};

export default function CodeEditor({
  code,
  onCodeChange,
  language,
  onAiSuggestionsUpdate,
  onIsAiRunningUpdate,
}: CodeEditorProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (code.trim().length > 20) {
        onIsAiRunningUpdate(true);
        try {
          const suggestions = await getAiSuggestions({ code, language });
          onAiSuggestionsUpdate(suggestions);
        } catch (e) {
          onAiSuggestionsUpdate(null);
        } finally {
          onIsAiRunningUpdate(false);
        }
      } else {
        onAiSuggestionsUpdate(null);
      }
    }, 1500);

    return () => {
      clearTimeout(handler);
    };
  }, [code, language, onAiSuggestionsUpdate, onIsAiRunningUpdate]);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const lineCount = useMemo(() => code.split("\n").length, [code]);
  const lines = useMemo(() => Array.from({ length: lineCount }, (_, i) => i + 1), [lineCount]);

  return (
    <Card className="flex-1 flex flex-col h-full overflow-hidden">
      <CardContent className="p-0 flex-1 relative">
        <div 
          ref={lineNumbersRef}
          className="absolute left-0 top-0 h-full w-12 text-right pr-4 text-muted-foreground pt-3 select-none font-code text-sm bg-card overflow-y-hidden"
          aria-hidden="true"
        >
          {lines.map((lineNumber) => (
            <div key={lineNumber} className="h-[21px] leading-[21px]">{lineNumber}</div>
          ))}
        </div>
        <Textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          onScroll={handleScroll}
          placeholder="Write your code here..."
          className="w-full h-full p-3 pl-14 font-code text-sm resize-none focus-visible:ring-primary border-0 rounded-lg bg-card leading-[21px]"
          spellCheck="false"
        />
      </CardContent>
    </Card>
  );
}
