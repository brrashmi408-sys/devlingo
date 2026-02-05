// lib/llm/groqClient.ts
import { explainErrorPrompt } from "@/lib/prompts/explainError";
import { getCategoryAwarePrompt, getCategorySystemPrompt } from "@/lib/prompts/categoryAwarePrompts";
import { SUPPORTED_LANGS, type SupportedLang } from "../i18n/languages";
import { classifyError, type ErrorCategory } from "@/lib/utils/errorClassifier";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function chatWithGroq(message: string, conversationContext: string, lang: string = "en") {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    if (!SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS]) {
        throw new Error(`Unsupported language: ${lang}. Supported: ${Object.keys(SUPPORTED_LANGS).join(", ")}`);
    }

    const langName = SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS];

    // Create a conversational prompt for Groq
    const chatPrompt = `You are DevLingo, a friendly AI assistant. You're having a casual conversation.

Previous conversation:
${conversationContext}

User message: "${message}"

Please respond naturally and conversationally in ${lang === "en" ? "English" : lang}. Be friendly, helpful, and engaging. Keep your responses concise but informative.

This is NOT an error-fixing session. Do not provide code corrections unless specifically asked. Do not act like a technical debugger.

Respond in a single, clean message without any JSON formatting or special characters.`;

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 300,
            messages: [
                {
                    role: "system",
                    content: chatPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Empty response from Groq");
    }

    return content;
}

export async function explainWithGroq(errorMessage: string, lang: string = "en") {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    if (!SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS]) {
        throw new Error(`Unsupported language: ${lang}. Supported: ${Object.keys(SUPPORTED_LANGS).join(", ")}`);
    }

    const langName = SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS];

    // 🔥 Updated prompt: explanation + suggestion + CORRECTED CODE EXAMPLE
    const fullPrompt = `
${explainErrorPrompt(errorMessage)}

CRITICAL INSTRUCTIONS:
${lang === "en" ?
            "Respond in clear, professional English." :
            `TRANSLATE EVERYTHING TO ${langName.toUpperCase()}. Use simple, natural language. Keep ALL code snippets, technical terms, variable names, and file paths in English.`}

Return ONLY valid JSON (no markdown, no extra text):
{
  "explanation": "Clear explanation of the error (1-3 sentences)",
  "suggestion": "Step-by-step numbered fix instructions", 
  "correctedCode": "Complete working code example that fixes this error"
}
    `.trim();

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 1200,  // Increased for code examples
            messages: [
                {
                    role: "system",
                    content: `You are DevLingo, a coding error explainer. ALWAYS respond with valid JSON only:

{
  "explanation": "What went wrong and why (1-3 sentences)",
  "suggestion": "3-5 step numbered fix instructions", 
  "correctedCode": "Complete, working code example that fixes this exact error"
}

Never use markdown, code blocks, or extra text. Code must be valid and executable.`
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Empty response from Groq");
    }

    return content;
}

export async function explainWithGroqAutoDetect(errorMessage: string, lang: string = "en") {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    if (!SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS]) {
        throw new Error(`Unsupported language: ${lang}. Supported: ${Object.keys(SUPPORTED_LANGS).join(", ")}`);
    }

    const langName = SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS];

    // 🎯 Auto-detect error category
    const category = classifyError(errorMessage);
    
    // 🎯 Get category-aware prompt
    const categoryPrompt = getCategoryAwarePrompt(errorMessage, category);
    const systemPrompt = getCategorySystemPrompt(category);

    // 🔥 Enhanced prompt with category awareness
    const fullPrompt = `
${categoryPrompt}

CRITICAL INSTRUCTIONS:
${lang === "en" ?
            "Respond in clear, professional English." :
            `TRANSLATE EVERYTHING TO ${langName.toUpperCase()}. Use simple, natural language. Keep ALL code snippets, technical terms, variable names, and file paths in English.`}

Return ONLY valid JSON (no markdown, no extra text):
{
  "explanation": "Clear explanation of the error (1-3 sentences)",
  "suggestion": "Step-by-step numbered fix instructions", 
  "correctedCode": "Complete working code example that fixes this error"
}
    `.trim();

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 1200,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: fullPrompt
                }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Empty response from Groq");
    }

    return content;
}
