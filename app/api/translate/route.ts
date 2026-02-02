import { NextResponse } from "next/server";
import { translateWithLingo } from "@/lib/localization/lingo";

export async function POST(req: Request) {
    try {
        const { text, lang } = await req.json();

        if (!text || !lang) {
            return NextResponse.json(
                { success: false, error: "Missing text or language" },
                { status: 400 }
            );
        }

        const translated = await translateWithLingo(text, lang);

        return NextResponse.json({
            success: true,
            ...translated,
        });
    } catch (err) {
        console.error("Lingo translation error:", err);

        return NextResponse.json(
            { success: false, error: "Translation failed" },
            { status: 500 }
        );
    }
}
