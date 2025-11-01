"use client";

import { Code2, Play, Save, Share2, LoaderCircle, Users, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type HeaderProps = {
  language: string;
  onLanguageChange: (language: string) => void;
  onRunCode: () => void;
  isExecuting: boolean;
};

export default function Header({
  language,
  onLanguageChange,
  onRunCode,
  isExecuting,
}: HeaderProps) {
  const [shareUrl, setShareUrl] = useState("https://codecollab.dev/s/aB3xZ9pL");
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied to Clipboard",
      description: "Shareable link has been copied.",
    });
  };

  return (
    <header className="flex items-center justify-between p-3 border-b bg-card h-16 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground hidden sm:block">
            CodeCollab
          </h1>
        </div>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[150px] focus:ring-primary">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline"><Share2 className="mr-0 sm:mr-2"/> <span className="hidden sm:inline">Share</span></Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Share Project</h4>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can view this code.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="share-link">Link</Label>
                <div className="flex items-center gap-2">
                    <Input id="share-link" value={shareUrl} readOnly />
                    <Button size="icon" className="shrink-0" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline"><Save className="mr-0 sm:mr-2" /> <span className="hidden sm:inline">Save</span></Button>
        <Button onClick={onRunCode} disabled={isExecuting}>
          {isExecuting ? (
            <LoaderCircle className="animate-spin mr-0 sm:mr-2" />
          ) : (
            <Play className="mr-0 sm:mr-2" />
          )}
          <span className="hidden sm:inline">{isExecuting ? "Running..." : "Run"}</span>
        </Button>
      </div>
    </header>
  );
}
