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
        let outputLines: string[] = [];

        const extractSimpleContent = (match: string, regex: RegExp) => {
            const freshRegex = new RegExp(regex.source, 'g');
            const innerMatch = freshRegex.exec(match);
            if (innerMatch && innerMatch[1]) {
                try {
                    // eslint-disable-next-line no-eval
                    const evaluated = eval(innerMatch[1]);
                    return evaluated.toString();
                } catch {
                    return innerMatch[1].replace(/['"`]/g, '').replace(/ << std::endl/g, '').replace(/\\n/g, '');
                }
            }
            return '';
        }
        
        const executeJs = (jsCode: string) => {
            const output: any[] = [];
            const originalLog = console.log;
            console.log = (...args) => {
                const formattedArgs = args.map(arg => {
                    if (Array.isArray(arg)) {
                        return `[${arg.join(', ')}]`;
                    }
                    if (typeof arg === 'object' && arg !== null) {
                        return JSON.stringify(arg);
                    }
                    return String(arg);
                });
                output.push(formattedArgs.join(' '));
            };
            try {
                new Function(jsCode)();
            } catch(e) {
                if (e instanceof Error) {
                    output.push(`Error: ${e.message}`);
                } else {
                    output.push("An unknown error occurred.");
                }
            } finally {
                console.log = originalLog;
            }
            return output;
        }


        switch (language) {
          case 'javascript':
            result += `> node script.js\n`;
            outputLines = executeJs(code);
            break;
          case 'python':
            const printRegex = /print\(([\s\S]*?)\)/g;
            result += `> python script.py\n`;
             Array.from(code.matchAll(printRegex)).forEach(match => {
               outputLines.push(extractSimpleContent(match[0], printRegex));
            });
            break;
          case 'cpp':
            const coutRegex = /std::cout << ([\s\S]*?);/g;
            result += `> g++ main.cpp -o main && ./main\n`;
            Array.from(code.matchAll(coutRegex)).forEach(match => {
              outputLines.push(extractSimpleContent(match[0], coutRegex));
            });
            break;
          case 'java':
            const printlnRegex = /System\.out\.println\(([\s\S]*?)\);?/g;
            result += `> javac Main.java && java Main\n`;
            Array.from(code.matchAll(printlnRegex)).forEach(match => {
               outputLines.push(extractSimpleContent(match[0], printlnRegex));
            });
            break;
          case 'c':
            const printfRegex = /printf\(([\s\S]*?)\);?/g;
            result += `> gcc main.c -o main && ./main\n`;
            Array.from(code.matchAll(printfRegex)).forEach(match => {
               outputLines.push(extractSimpleContent(match[0], printfRegex));
            });
            break;
          case 'ruby':
            const putsRegex = /puts ([\s\S]*)/g;
            result += `> ruby script.rb\n`;
            Array.from(code.matchAll(putsRegex)).forEach(match => {
               outputLines.push(extractSimpleContent(match[0], putsRegex));
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
