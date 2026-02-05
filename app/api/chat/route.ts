// app/api/chat/route.ts
import { NextResponse } from "next/server";
import { chatWithGroq } from "@/lib/llm/groqClient";

// Simple in-memory chat history (in production, use a database)
const chatHistory = new Map<string, Array<{role: string, content: string}>>();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, sessionId = "default", lang = "en" } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Invalid message provided" },
                { status: 400 }
            );
        }

        // Get or create chat history for this session
        if (!chatHistory.has(sessionId)) {
            chatHistory.set(sessionId, []);
        }
        const history = chatHistory.get(sessionId)!;

        // Add user message to history
        history.push({ role: "user", content: message });

        // Build conversation context for Groq
        const conversationContext = history
            .slice(-6) // Keep last 6 messages for context
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n');

        // Generate AI response using Groq chat
        console.log("Chat API - Processing message:", message, "Language:", lang);
        
        // Use Groq for conversational response
        const aiResponse = await chatWithGroq(message, conversationContext, lang);
        
        console.log("Chat API - Groq response:", aiResponse);
        
        // Add AI response to history
        history.push({ role: "assistant", content: aiResponse });
        
        return NextResponse.json({
            success: true,
            response: aiResponse,
            sessionId
        });
    } catch (err: any) {
        console.error("Chat API Error:", err);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process chat message",
                response: "Sorry, I encountered an error. Please try again."
            },
            { status: 500 }
        );
    }
}

async function generateAIResponse(message: string, context: string, lang: string): Promise<string> {
    const lowerMessage = message.toLowerCase().trim();
    
    console.log("Generating response for:", lowerMessage, "Context:", context);
    
    // Simple immediate responses
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
        const responses = {
            en: "Hello! How can I help you today?",
            es: "¡Hola! ¿Cómo puedo ayudarte hoy?",
            fr: "Bonjour! Comment puis-je vous aider aujourd'hui?",
            de: "Hallo! Wie kann ich Ihnen heute helfen?"
        };
        return responses[lang as keyof typeof responses] || responses.en;
    }
    
    if (lowerMessage.includes('how are you')) {
        const responses = {
            en: "I'm doing great, thanks for asking! Ready to help.",
            es: "¡Estoy genial! ¿En qué puedo ayudarte hoy?",
            fr: "Je vais très bien! Comment puis-je vous aider?"
        };
        return responses[lang as keyof typeof responses] || responses.en;
    }
    
    // Default response
    const defaultResponses = {
        en: "That's interesting! Tell me more about what you need.",
        es: "¡Qué interesante! Cuéntame más sobre lo que necesitas.",
        fr: "C'est très intéressant ! Racontez-m'en plus."
    };
    
    const response = defaultResponses[lang as keyof typeof defaultResponses] || defaultResponses.en;
    console.log("Generated response:", response);
    return response;
}

// Optional: GET endpoint to retrieve chat history
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId") || "default";
    
    const history = chatHistory.get(sessionId) || [];
    
    return NextResponse.json({
        success: true,
        history,
        sessionId
    });
}
