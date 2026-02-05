// app/api/explain-auto/route.ts
import { NextResponse } from "next/server";
import { explainWithGroqAutoDetect } from "@/lib/llm/groqClient";
import { classifyError, type ErrorCategory } from "@/lib/utils/errorClassifier";

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

        // 🎯 Auto-detect error category
        const detectedCategory = classifyError(error);

        // 🔥 Use category-aware Groq call
        const llmResponse = await explainWithGroqAutoDetect(error, lang);

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
            correctedCode: parsed.correctedCode || "",
            detectedCategory // Include the detected category for frontend use
        };

        return NextResponse.json({
            success: true,
            ...responseData
        });
    } catch (err: any) {
        console.error("DevLingo Auto-Detect API Error:", err);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to explain the error",
                explanation: "",
                suggestion: "",
                correctedCode: "",
                detectedCategory: "general" as ErrorCategory
            },
            { status: 500 }
        );
    }
}
