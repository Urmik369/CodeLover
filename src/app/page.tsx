"use client";

import { useState, useCallback } from "react";
import type { AiCodeSuggestionsOutput } from "@/ai/flows/ai-code-suggestions";
import Header from "@/components/code-collab/header";
import CodeEditor from "@/components/code-collab/code-editor";
import ResultPanels from "@/components/code-collab/result-panels";

const initialCode: Record<string, string> = {
  javascript: `// Welcome to CodeCollab!
// Select a language and start coding.

function greet(name) {
  // Try changing this message!
  console.log("Hello, " + name + "!");
}

greet("Collaborative Coder");
`,
  python: `# Welcome to CodeCollab!
# Select a language and start coding.

def greet(name):
  # Try changing this message!
  print(f"Hello, {name}!")

greet("Collaborative Coder")
`,
  cpp: `// Welcome to CodeCollab!
// Select a language and start coding.

#include <iostream>
#include <string>

void greet(std::string name) {
    // Try changing this message!
    std::cout << "Hello, " << name << "!" << std::endl;
}

int main() {
    greet("Collaborative Coder");
    return 0;
}
`,
  java: `// Welcome to CodeCollab!
// Select a language and start coding.

public class Main {
    public static void main(String[] args) {
        // Try changing this message!
        System.out.println("Hello, Collaborative Coder!");
    }
}
`,
  c: `// Welcome to CodeCollab!
// Select a language and start coding.

#include <stdio.h>

int main() {
    // Try changing this message!
    printf("Hello, Collaborative Coder!\\n");
    return 0;
}
`,
  ruby: `# Welcome to CodeCollab!
# Select a language and start coding.

def greet(name)
  # Try changing this message!
  puts "Hello, #{name}!"
end

greet("Collaborative Coder")
`,
  php: `<?php
// Welcome to CodeCollab!
// Select a language and start coding.

function greet($name) {
    // Try changing this message!
    echo "Hello, " . $name . "!";
}

greet("Collaborative Coder");
?>
`,
  csharp: `// Welcome to CodeCollab!
// Select a language and start coding.

using System;

class Program
{
    static void Main()
    {
        // Try changing this message!
        Console.WriteLine("Hello, Collaborative Coder!");
    }
}
`,
  swift: `// Welcome to CodeCollab!
// Select a language and start coding.

func greet(name: String) {
    // Try changing this message!
    print("Hello, \\(name)!")
}

greet(name: "Collaborative Coder")
`,
};


export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(initialCode.javascript);
  const [aiSuggestions, setAiSuggestions] = useState<AiCodeSuggestionsOutput | null>(null);
  const [isAiRunning, setIsAiRunning] = useState(false);
  const [output, setOutput] = useState("Click 'Run' to see the output here.");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(initialCode[newLanguage] || "");
    setOutput("Click 'Run' to see the output here.");
    setAiSuggestions(null);
  };
  
  const handleRunCode = useCallback(() => {
    setIsExecuting(true);
    setOutput("Executing code...");
    setTimeout(() => {
      let result = "";
      switch (language) {
        case "javascript":
          result = `> node script.js\nHello, Collaborative Coder!`;
          break;
        case "python":
          result = `> python script.py\nHello, Collaborative Coder!`;
          break;
        case "cpp":
          result = `> g++ main.cpp -o main && ./main\nHello, Collaborative Coder!`;
          break;
        case "java":
          result = `> javac Main.java && java Main\nHello, Collaborative Coder!`;
          break;
        case "c":
          result = `> gcc main.c -o main && ./main\nHello, Collaborative Coder!`;
          break;
        case "ruby":
          result = `> ruby script.rb\nHello, Collaborative Coder!`;
          break;
        case "php":
          result = `> php script.php\nHello, Collaborative Coder!`;
          break;
        case "csharp":
          result = `> dotnet run\nHello, Collaborative Coder!`;
          break;
        case "swift":
          result = `> swift run\nHello, Collaborative Coder!`;
          break;
        default:
          result = "Language not supported for execution.";
      }
      setOutput(result);
      setIsExecuting(false);
    }, 1500);
  }, [language]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header 
        language={language}
        onLanguageChange={handleLanguageChange}
        onRunCode={handleRunCode}
        isExecuting={isExecuting}
      />
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
        <div className="flex flex-col h-full min-h-0">
          <CodeEditor 
            code={code}
            onCodeChange={setCode}
            language={language}
            onAiSuggestionsUpdate={setAiSuggestions}
            onIsAiRunningUpdate={setIsAiRunning}
          />
        </div>
        <div className="flex flex-col h-full overflow-hidden min-h-0">
          <ResultPanels
            aiSuggestions={aiSuggestions}
            isAiRunning={isAiRunning}
            output={output}
          />
        </div>
      </main>
    </div>
  );
}
