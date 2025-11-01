
"use client";

import { useState, useCallback } from "react";
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
  const [output, setOutput] = useState("Click 'Run' to see the output here.");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(initialCode[newLanguage] || "");
    setOutput("Click 'Run' to see the output here.");
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
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch (e) {
                            return '[Circular Object]';
                        }
                    }
                    return String(arg);
                });
                output.push(formattedArgs.join(' '));
            };
        
            console.log = customLog;
        
            try {
                new Function(jsCode)();
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
                const a = parseFloat(value);
                return a;
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


        const executeCpp = (cppCode: string) => {
            const output: string[] = [];
            const variables: Record<string, any> = {};

            const evaluateCppExpression = (expr: string): any => {
              expr = expr.trim();
              if (expr in variables) {
                  return variables[expr];
              }
              if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
                  return expr.slice(1, -1);
              }
              if (!isNaN(Number(expr))) {
                  return Number(expr);
              }
              // Basic arithmetic
              const operators = ['+', '-', '*', '/'];
              for (const op of operators) {
                  if (expr.includes(op)) {
                      const parts = expr.split(op).map(p => p.trim());
                      const values = parts.map(p => evaluateCppExpression(p));
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
              return expr;
            };

            const extractSimpleContent = (line: string): string => {
                return line.split('<<').map(part => {
                    part = part.trim();
                    if (part === 'endl' || part === 'std::endl') return '\n';
                    if (part in variables) return variables[part];
                    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
                        return part.slice(1, -1);
                    }
                    return evaluateCppExpression(part);
                }).join('');
            };

            const lines = cppCode.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('//') || !trimmedLine || trimmedLine.startsWith('#') || trimmedLine.includes('using namespace') || trimmedLine.startsWith('int main') || trimmedLine.startsWith('{') || trimmedLine.startsWith('}') || trimmedLine.startsWith('return')) continue;

                // Variable declaration and assignment: int a = 5;
                const declarationMatch = trimmedLine.match(/^(int|string|char|double|float)\s+([\w\s,=]+);/);
                if (declarationMatch) {
                    const assignments = declarationMatch[2].split(',');
                    assignments.forEach(assign => {
                        const parts = assign.split('=').map(p => p.trim());
                        if (parts.length === 2) {
                            variables[parts[0]] = evaluateCppExpression(parts[1]);
                        } else {
                            variables[parts[0]] = undefined;
                        }
                    });
                    continue;
                }

                // Assignment to existing var: temp = a;
                const assignmentMatch = trimmedLine.match(/^(\w+)\s*=\s*(.*);/);
                if (assignmentMatch) {
                    const [, varName, expression] = assignmentMatch;
                    variables[varName] = evaluateCppExpression(expression);
                    continue;
                }
                
                // cout statement
                const coutMatch = trimmedLine.match(/(?:std::)?cout\s*<<(.*);/);
                if (coutMatch) {
                    output.push(extractSimpleContent(coutMatch[1]));
                }
            }
            return output;
        };

        const executeJava = (javaCode: string) => {
            const output: string[] = [];
            const variables: Record<string, any> = {};

            const evaluateJavaExpression = (expr: string) => {
                expr = expr.trim();
                if (expr in variables) return variables[expr];
                if ((expr.startsWith('"') && expr.endsWith('"'))) return expr.slice(1, -1);
                if (expr.endsWith('F')) return parseFloat(expr.slice(0,-1));
                if (expr.match(/^\d+(\.\d+)?(e\d+)?$/)) return Number(expr);
                
                const operators = ['+', '-', '*', '/'];
                for (const op of operators) {
                    if (expr.includes(op)) {
                        const parts = expr.split(op).map(p => p.trim());
                        const values = parts.map(p => evaluateJavaExpression(p));
                        if (values.every(v => typeof v === 'number')) {
                            switch (op) {
                                case '+': return values.reduce((a, b) => a + b);
                                case '-': return values.reduce((a, b) => a - b);
                                case '*': return values.reduce((a, b) => a * b);
                                case '/': return values.reduce((a, b) => a / b);
                            }
                        } else { // string concat
                           return values.join('');
                        }
                    }
                }
                return expr;
            };

            const lines = javaCode.split('\n');
            for(const line of lines) {
                const trimmedLine = line.trim();
                 if (trimmedLine.startsWith('//') || !trimmedLine || trimmedLine.startsWith('public class') || trimmedLine.startsWith('public static void') || trimmedLine.startsWith('{') || trimmedLine.startsWith('}')) continue;

                // Variable declaration: double myDouble = 3.4;
                const varMatch = trimmedLine.match(/^(double|float|int|String)\s+([\w\s,=\.]+?);/);
                if (varMatch) {
                   const declaration = varMatch[2];
                   const assignments = declaration.split(',');
                   assignments.forEach(assign => {
                     const parts = assign.split('=').map(p => p.trim());
                     if (parts.length === 2) {
                       variables[parts[0]] = evaluateJavaExpression(parts[1]);
                     } else {
                       variables[parts[0]] = undefined;
                     }
                   });
                   continue;
                }
                
                // System.out.println(myDouble);
                const printlnMatch = trimmedLine.match(/System\.out\.println\((.*)\);/);
                if (printlnMatch) {
                    const content = printlnMatch[1].trim();
                    output.push(evaluateJavaExpression(content));
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
            result += `> g++ main.cpp -o main && ./main\n`;
            outputLines = executeCpp(code);
            break;
          case 'java':
            result += `> javac Main.java && java Main\n`;
            outputLines = executeJava(code);
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
          />
        </div>
        <div className="flex flex-col h-full overflow-hidden min-h-0">
          <ResultPanels
            output={output}
          />
        </div>
      </main>
    </div>
  );
}
    

    
