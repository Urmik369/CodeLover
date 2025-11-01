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

    // This is a mock execution. A real implementation would
    // use a code execution sandbox.
    setTimeout(() => {
      try {
        let result = "";
        const consoleLogRegex = /console\.log\((.*?)\);?/g;
        const printRegex = /print\((.*?)\)/g;
        const coutRegex = /std::cout << (.*?);/g;
        const printlnRegex = /System\.out\.println\((.*?)\);?/g;
        const printfRegex = /printf\((.*?)\);?/g;
        const putsRegex = /puts (.*)/g;

        let outputLines: string[] = [];

        const extractContent = (match: string, regex: RegExp) => {
          const innerMatch = regex.exec(match);
          if (innerMatch && innerMatch[1]) {
            // Naive removal of quotes and evaluation of simple string concatenation
            try {
               // eslint-disable-next-line no-eval
              const evaluated = eval(innerMatch[1]);
              return evaluated.toString();
            } catch {
              return innerMatch[1].replace(/['"`]/g, '');
            }
          }
          return '';
        };

        switch (language) {
          case 'javascript':
            result += `> node script.js\n`;
            code.match(consoleLogRegex)?.forEach(line => {
               outputLines.push(extractContent(line, new RegExp(consoleLogRegex.source)));
            });
            break;
          case 'python':
            result += `> python script.py\n`;
             code.match(printRegex)?.forEach(line => {
               outputLines.push(extractContent(line, new RegExp(printRegex.source)));
            });
            break;
          case 'cpp':
            result += `> g++ main.cpp -o main && ./main\n`;
            code.match(coutRegex)?.forEach(line => {
              outputLines.push(extractContent(line, new RegExp(coutRegex.source)).replace(/ << std::endl/, ''));
            });
            break;
          case 'java':
            result += `> javac Main.java && java Main\n`;
            code.match(printlnRegex)?.forEach(line => {
               outputLines.push(extractContent(line, new RegExp(printlnRegex.source)));
            });
            break;
          case 'c':
            result += `> gcc main.c -o main && ./main\n`;
            code.match(printfRegex)?.forEach(line => {
               outputLines.push(extractContent(line, new RegExp(printfRegex.source)).replace(/\\n/g, ''));
            });
            break;
          case 'ruby':
            result += `> ruby script.rb\n`;
            code.match(putsRegex)?.forEach(line => {
               outputLines.push(extractContent(line, new RegExp(putsRegex.source)));
            });
            break;
          default:
            result = "Language not supported for execution.";
        }
        
        if (outputLines.length > 0) {
            result += outputLines.join('\n');
        } else if (result && !outputLines.length && language !== 'default') {
            result += "No output was printed to the console.";
        }

        setOutput(result || "No executable code found or language not supported.");
      } catch (e) {
        if (e instanceof Error) {
            setOutput(`An error occurred during execution: \n${e.message}`);
        } else {
            setOutput("An unknown error occurred during execution.");
        }
      } finally {
        setIsExecuting(false);
      }
    }, 1500);
  }, [language, code]);

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
