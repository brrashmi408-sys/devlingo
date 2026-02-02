// lib/llm/groqClient.ts

import { explainErrorPrompt } from "@/lib/prompts/explainError";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function explainWithGroq(errorMessage: string) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful programming tutor."
                },
                {
                    role: "user",
                    content: explainErrorPrompt(errorMessage)
                }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error: ${errText}`);
    }

    const data = await response.json();

    // Groq returns OpenAI-compatible response
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("Empty response from Groq");
    }

    return content;
}
