import { ErrorCategory } from "@/lib/utils/errorClassifier";

const categoryPrompts = {
    cli: {
        system: "You are a CLI and command-line expert. Focus on command syntax, tool installation, and terminal operations.",
        context: "This is a command-line/terminal error. Provide specific command examples and explain shell operations clearly."
    },
    compiler: {
        system: "You are a compiler and syntax expert. Focus on language syntax, type errors, and compilation issues.",
        context: "This is a compiler/syntax error. Explain the language rules and provide corrected code with proper syntax."
    },
    runtime: {
        system: "You are a runtime error expert. Focus on execution flow, variable states, and program behavior.",
        context: "This is a runtime error. Explain what went wrong during execution and how to handle edge cases."
    },
    environment: {
        system: "You are a development environment expert. Focus on dependencies, configuration, and setup issues.",
        context: "This is an environment/setup error. Explain dependency management, configuration, and environment setup."
    },
    general: {
        system: "You are a full-stack development expert. Provide comprehensive debugging and problem-solving guidance.",
        context: "This is a general programming error. Provide thorough explanation and debugging steps."
    }
};

export function getCategoryAwarePrompt(errorMessage: string, category: ErrorCategory): string {
    const prompt = categoryPrompts[category];
    
    return `
${prompt.context}

Error Details:
${errorMessage}

Provide a comprehensive explanation that includes:
- What exactly went wrong
- Why this error occurs in this context
- Step-by-step solution with specific examples
- Prevention tips for the future

Focus on practical, actionable solutions that work immediately.
`.trim();
}

export function getCategorySystemPrompt(category: ErrorCategory): string {
    const baseSystem = categoryPrompts[category].system;
    
    return `${baseSystem}

Always respond in valid JSON format:
{
  "explanation": "Clear explanation of what went wrong and why (2-3 sentences)",
  "suggestion": "Step-by-step numbered fix instructions (3-5 steps)",
  "correctedCode": "Complete working code example that fixes this exact error (if applicable)"
}

Be specific, practical, and provide executable solutions. Never use markdown or code blocks in your response.`;
}
