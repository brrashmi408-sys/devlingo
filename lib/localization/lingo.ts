// lib/localization/lingo.ts

import { LingoDotDevEngine } from "lingo.dev/sdk";

if (!process.env.LINGO_API_KEY) {
    throw new Error("LINGO_API_KEY is missing in environment variables");
}

const lingo = new LingoDotDevEngine({
    apiKey: process.env.LINGO_API_KEY,
});

type SupportedLang = "ta" | "hi";

export async function translateWithLingo(
    text: {
        explanation: string;
        suggestion: string;
    },
    targetLang: SupportedLang
) {
    const explanation = await lingo.localizeText(text.explanation, {
        sourceLocale: "en",
        targetLocale: targetLang,
    });

    const suggestion = await lingo.localizeText(text.suggestion, {
        sourceLocale: "en", 
        targetLocale: targetLang,
    });

    return {
        explanation,
        suggestion,
    };
}
