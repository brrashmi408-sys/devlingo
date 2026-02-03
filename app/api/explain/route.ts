// app/api/explain/route.ts
import { NextResponse } from "next/server";
import { explainWithGroq } from "@/lib/llm/groqClient";

const SUPPORTED_LANGS = {
    en: "English",
    hi: "Hindi",
    kn: "Kannada",
    ml: "Malayalam",
    ta: "Tamil",
    te: "Telugu",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
} as const;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { error, lang = "en" } = body;

        if (!error || typeof error !== "string") {
            return NextResponse.json(
                { error: "Invalid error message provided" },
                { status: 400 }
            );
        }

        if (!SUPPORTED_LANGS[lang as keyof typeof SUPPORTED_LANGS]) {
            return NextResponse.json(
                { error: `Unsupported language: ${lang}. Supported: ${Object.keys(SUPPORTED_LANGS).join(", ")}` },
                { status: 400 }
            );
        }

        // 🔥 Single Groq call: explain + translate + corrected code in ONE prompt
        const llmResponse = await explainWithGroq(error, lang);

        // Parse JSON response
        let parsed;
        try {
            parsed = JSON.parse(llmResponse);
        } catch {
            parsed = {
                explanation: llmResponse || "Could not parse explanation.",
                suggestion: "Check the error message carefully and review your code.",
                correctedCode: ""
            };
        }

        // Ensure all required fields exist
        const responseData = {
            explanation: parsed.explanation || "No explanation available.",
            suggestion: parsed.suggestion || "No fix suggestion available.",
            correctedCode: parsed.correctedCode || ""
        };

        return NextResponse.json({
            success: true,
            ...responseData
        });
    } catch (err: any) {
        console.error("DevLingo API Error:", err);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to explain the error",
                explanation: "",
                suggestion: "",
                correctedCode: ""
            },
            { status: 500 }
        );
    }
}
