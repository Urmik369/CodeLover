
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
        
        const executeJs = (jsCode: string) => {
            const output: string[] = [];
            const originalLog = console.log;
            const customLog = (...args: any[]) => {
                const formattedArgs = args.map(arg => {
                    if (typeof arg === 'object' && arg !== null) {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                });
                output.push(formattedArgs.join(' '));
            };
        
            console.log = customLog;
        
            try {
                // Use a new Function constructor to execute code in a semi-isolated scope
                // It's not perfectly safe, but safer than direct eval for this mock scenario.
                new Function('console', jsCode)({ log: customLog });
            } catch (e) {
                if (e instanceof Error) {
                    output.push(`Error: ${e.message}`);
                } else {
                    output.push("An unknown error occurred.");
                }
            } finally {
                // Restore original console.log
                console.log = originalLog;
            }
            return output;
        };
        
        const executePython = (pyCode: string) => {
          const output: string[] = [];
          let inputCounter = 0;
          const mockedInputs = ['10', '10.0', '5', '2'];

          const mockedCode = pyCode.replace(/input\((.*?)\)/g, () => {
            const val = mockedInputs[inputCounter % mockedInputs.length];
            inputCounter++;
            return `"${val}"`;
          });

          const variables: Record<string, any> = {};

          const evaluateExpression = (expr: string): any => {
            expr = expr.trim();
            if (expr in variables) {
              return variables[expr];
            }
            if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
              return expr.slice(1, -1);
            }
             // Handle float()
            const floatMatch = expr.match(/^float\((.*)\)$/);
            if (floatMatch) {
                const innerExpr = floatMatch[1];
                const value = evaluateExpression(innerExpr);
                return parseFloat(value);
            }
            
            if (!isNaN(Number(expr))) {
              return Number(expr);
            }

            // Handle simple arithmetic
            const operators = ['+', '-', '*', '/'];
            for (const op of operators) {
                if (expr.includes(op)) {
                    const parts = expr.split(op).map(p => p.trim());
                    const values = parts.map(p => evaluateExpression(p));
                    if (values.every(v => typeof v === 'number')) {
                        switch (op) {
                            case '+': return values.reduce((a, b) => a + b);
                            case '-': return values.reduce((a, b) => a - b);
                            case '*': return values.reduce((a, b) => a * b);
                            case '/': return values.reduce((a, b) => a / b);
                        }
                    }
                }
            }

            return expr; // Fallback
          };
          
          const lines = mockedCode.split('\n');
          for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('#') || !trimmedLine) continue;

              const assignmentMatch = trimmedLine.match(/^(\w+)\s*=\s*(.*)$/);
              if (assignmentMatch) {
                  const [, varName, expression] = assignmentMatch;
                  variables[varName] = evaluateExpression(expression);
                  continue;
              }

              const printMatch = trimmedLine.match(/^print\((.*)\)$/);
              if (printMatch) {
                  let content = printMatch[1].trim();

                  // Handle f-string
                  if (content.startsWith('f"') || content.startsWith("f'")) {
                      content = content.slice(2, -1);
                      const formatted = content.replace(/\{(.+?)\}/g, (_, varName) => {
                          return variables[varName.trim()] ?? '';
                      });
                      output.push(formatted);
                      continue;
                  }
                  
                  // Handle .format()
                  const formatMatch = content.match(/^(['"])(.*?)\1\.format\((.*?)\)$/);
                  if (formatMatch) {
                      let template = formatMatch[2];
                      const args = formatMatch[3].split(',').map(arg => evaluateExpression(arg.trim()));
                      let i = 0;
                      const formatted = template.replace(/\{(\{.*?\})\}|(\{\d*\})/g, (match, escaped, normal) => {
                          if (escaped) return escaped;
                          const argIndex = normal.slice(1,-1) ? parseInt(normal.slice(1,-1)) : i++;
                          return args[argIndex] ?? '';
                      });
                      output.push(formatted);
                      continue;
                  }

                  // Handle simple print with variables
                  const parts = content.split(',').map(part => {
                      const evaluated = evaluateExpression(part.trim());
                      return String(evaluated);
                  });
                  output.push(parts.join(' '));
              }
          }
          return output;
        };

        const executeC = (cCode: string) => {
          const output: string[] = [];
          const variables: Record<string, any> = {};

          const evaluateCExpression = (expr: string): any => {
            expr = expr.trim();
            if (expr in variables) {
              return variables[expr];
            }
            if (!isNaN(Number(expr))) {
              return Number(expr);
            }
             // Simple arithmetic
             const addMatch = expr.match(/(\w+)\s*\+\s*(\w+)/);
             if (addMatch) return evaluateCExpression(addMatch[1]) + evaluateCExpression(addMatch[2]);
             const subMatch = expr.match(/(\w+)\s*-\s*(\w+)/);
             if (subMatch) return evaluateCExpression(subMatch[1]) - evaluateCExpression(subMatch[2]);
             const mulMatch = expr.match(/(\w+)\s*\*\s*(\w+)/);
             if (mulMatch) return evaluateCExpression(mulMatch[1]) * evaluateCExpression(mulMatch[2]);
             const divMatch = expr.match(/(\w+)\s*\/\s*(\w+)/);
             if (divMatch) return Math.floor(evaluateCExpression(divMatch[1]) / evaluateCExpression(divMatch[2])); // Integer division
             const modMatch = expr.match(/(\w+)\s*%\s*(\w+)/);
             if (modMatch) return evaluateCExpression(modMatch[1]) % evaluateCExpression(modMatch[2]);

            return expr; // Fallback
          };
          
          const lines = cCode.split('\n');
          for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('//') || !trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('int main()') || trimmedLine.startsWith('{') || trimmedLine.startsWith('}') || trimmedLine.startsWith('return')) continue;

              // int a = 9,b = 4, c;
              const multiDeclareMatch = trimmedLine.match(/^(int|float|char|double)\s+(.*);/);
              if (multiDeclareMatch) {
                  const assignments = multiDeclareMatch[2].split(',');
                  assignments.forEach(assign => {
                      const parts = assign.split('=').map(p => p.trim());
                      if (parts.length === 2) {
                          variables[parts[0]] = evaluateCExpression(parts[1]);
                      } else {
                          variables[parts[0]] = undefined;
                      }
                  });
                  continue;
              }

              // c = a+b;
              const assignmentMatch = trimmedLine.match(/^(\w+)\s*=\s*(.*);/);
              if (assignmentMatch) {
                  const [, varName, expression] = assignmentMatch;
                  variables[varName] = evaluateCExpression(expression);
                  continue;
              }

              // printf("a+b = %d \n",c);
              const printfMatch = trimmedLine.match(/^printf\((.*?)\);/);
              if (printfMatch) {
                const args = printfMatch[1].split(',').map(a => a.trim());
                let formatString = args.shift()?.slice(1, -1) ?? '';
                let argIndex = 0;
                const formatted = formatString.replace(/%d|%f/g, () => {
                    const varName = args[argIndex++];
                    return variables[varName] ?? 'null';
                }).replace(/\\n/g, '\n');
                output.push(formatted);
              }
          }
          return output;
        };


        switch (language) {
          case 'javascript':
            result += `> node script.js\n`;
            outputLines = executeJs(code);
            break;
          case 'python':
            result += `> python script.py\n`;
            outputLines = executePython(code);
            break;
          case 'cpp':
            const coutRegex = /(?:std::)?cout\s*<<\s*([\s\S]*?);/g;
            result += `> g++ main.cpp -o main && ./main\n`;
            Array.from(code.matchAll(coutRegex)).forEach(match => {
                const line = match[1]
                  .split('<<')
                  .map(part => {
                      part = part.trim();
                      if (part === 'endl' || part === 'std::endl') return '\n';
                      // A very basic attempt to simulate variable output
                      // This does not handle scope or types.
                      const variableMatch = code.match(new RegExp(`(int|string|char|double|float)\\s+${part}\\s*=\\s*(.*?);`));
                      if (variableMatch) {
                         // remove quotes from strings
                         return variableMatch[2].replace(/"/g, '');
                      }
                       // remove quotes from literal strings
                      return part.replace(/"/g, '');
                  })
                  .join('');
                outputLines.push(line);
            });
            break;
          case 'java':
            const printlnRegex = /System\.out\.println\(([\s\S]*?)\);?/g;
            result += `> javac Main.java && java Main\n`;
            Array.from(code.matchAll(printlnRegex)).forEach(match => {
              const content = match[1].trim();
              
              // Handle literal strings
              if (content.startsWith('"') && content.endsWith('"')) {
                outputLines.push(content.slice(1, -1));
                return;
              }

              // Handle variables
              // This is a very basic simulation and doesn't handle scope, types perfectly etc.
              const variableRegex = new RegExp(`(double|float|int|String)\\s+${content}\\s*=\\s*(.*?);`);
              const variableMatch = code.match(variableRegex);

              if (variableMatch && variableMatch[2]) {
                let value = variableMatch[2].trim();
                // Remove quotes from string literals, F from floats
                value = value.replace(/"/g, '').replace(/F$/i, '');
                outputLines.push(value);
              } else {
                 outputLines.push(content);
              }
            });
            break;
          case 'c':
            result += `> gcc main.c -o main && ./main\n`;
            outputLines = executeC(code);
            break;
          default:
            result = "Language not supported for execution.";
        }
        
        if (outputLines.length > 0) {
            result += outputLines.join('\n').replace(/\n\n/g, '\n');
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
    

    
