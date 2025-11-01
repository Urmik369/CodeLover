"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import OutputPanel from "./output-panel";
import { Terminal } from "lucide-react";

type ResultPanelsProps = {
  output: string;
};

export default function ResultPanels({
  output,
}: ResultPanelsProps) {
  return (
    <Card className="h-full flex flex-col">
       <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 pb-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold p-2">
            <Terminal className="h-5 w-5" />
            Output
          </h2>
        </div>
        <div className="flex-1 overflow-auto p-2 pt-0 mt-0">
          <OutputPanel output={output} />
        </div>
      </div>
    </Card>
  );
}
