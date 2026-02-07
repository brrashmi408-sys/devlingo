import { NextResponse } from "next/server";
import { translateWithLingo } from "@/lib/localization/lingo";
import { translateChatMessage } from "@/lib/translator/chatTranslator";

export async function POST(req: Request) {
    try {
        const { text, lang, useFastTranslation = false } = await req.json();

        if (!text || !lang) {
            return NextResponse.json(
                { success: false, error: "Missing text or language" },
                { status: 400 }
            );
        }

        // Use fast Groq translation for chat messages, Lingo.dev for error messages
        if (useFastTranslation && text.explanation) {
            console.log("Using fast Groq translation for chat message");
            const translatedExplanation = await translateChatMessage(text.explanation, lang);
            
            return NextResponse.json({
                success: true,
                explanation: translatedExplanation,
                suggestion: text.suggestion || "", // Keep suggestion as-is for chat
            });
        } else {
            console.log("Using Lingo.dev translation for error message");
            const translated = await translateWithLingo(text, lang);

            return NextResponse.json({
                success: true,
                ...translated,
            });
        }
    } catch (err) {
        console.error("Translation error:", err);

        return NextResponse.json(
            { success: false, error: "Translation failed" },
            { status: 500 }
        );
    }
}
