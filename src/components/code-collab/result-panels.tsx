"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import AiAssistant from "./ai-assistant";
import OutputPanel from "./output-panel";
import VersionHistory from "./version-history";
import type { AiCodeSuggestionsOutput } from "@/ai/flows/ai-code-suggestions";
import { Bot, Terminal, History } from "lucide-react";

type ResultPanelsProps = {
  aiSuggestions: AiCodeSuggestionsOutput | null;
  isAiRunning: boolean;
  output: string;
};

export default function ResultPanels({
  aiSuggestions,
  isAiRunning,
  output,
}: ResultPanelsProps) {
  return (
    <Card className="h-full flex flex-col">
      <Tabs defaultValue="output" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="m-2 grid w-[calc(100%-1rem)] grid-cols-3 bg-muted/50">
          <TabsTrigger value="output"><Terminal className="mr-2" />Output</TabsTrigger>
          <TabsTrigger value="ai"><Bot className="mr-2" />AI Assistant</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2" />History</TabsTrigger>
        </TabsList>
        <TabsContent value="output" className="flex-1 overflow-auto p-2 pt-0 mt-0">
          <OutputPanel output={output} />
        </TabsContent>
        <TabsContent value="ai" className="flex-1 overflow-auto p-2 pt-0 mt-0">
          <AiAssistant suggestions={aiSuggestions} isRunning={isAiRunning} />
        </TabsContent>
        <TabsContent value="history" className="flex-1 overflow-auto p-2 pt-0 mt-0">
          <VersionHistory />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
