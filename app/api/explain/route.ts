// app/api/explain/route.ts

import { NextResponse } from "next/server";
import { explainWithGroq } from "@/lib/llm/groqClient";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { error } = body;

        if (!error || typeof error !== "string") {
            return NextResponse.json(
                { error: "Invalid error message provided" },
                { status: 400 }
            );
        }

        const llmResponse = await explainWithGroq(error);

        // Try parsing LLM response as JSON
        let parsed;
        try {
            parsed = JSON.parse(llmResponse);
        } catch {
            parsed = {
                language: "Unknown",
                explanation: llmResponse,
                suggestion: "Check the error message carefully and review your code."
            };
        }

        return NextResponse.json({
            success: true,
            ...parsed
        });
    } catch (err: any) {
        console.error("DevLingo API Error:", err);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to explain the error"
            },
            { status: 500 }
        );
    }
}
