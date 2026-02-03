"use client";

import { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

/* ---------- optional simple formatter (frontend-safe) ---------- */
function formatCode(code: string) {
    // basic indentation fix for one-line blocks (safe fallback)
    if (!code.includes("\n")) {
        return code
            .replace(/{/g, "{\n    ")
            .replace(/;/g, ";\n    ")
            .replace(/}/g, "\n}");
    }
    return code;
}

type Props = {
    role: "user" | "assistant";
    content?: string;
    explanation?: string;
    suggestion?: any;
    correctedCode?: string;
};

export function ChatMessage({
    role,
    content,
    explanation,
    suggestion,
    correctedCode,
}: Props) {
    const [copied, setCopied] = useState(false);

    const formattedCode = useMemo(
        () => (correctedCode ? formatCode(correctedCode) : ""),
        [correctedCode]
    );

    const handleCopy = async () => {
        if (formattedCode) {
            await navigator.clipboard.writeText(formattedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const suggestionText =
        typeof suggestion === "string"
            ? suggestion
            : Array.isArray(suggestion)
                ? suggestion.join(" ")
                : suggestion
                    ? String(suggestion)
                    : "";

    if (role === "user") {
        return (
            <div className="self-end max-w-[80%] rounded-lg bg-muted px-4 py-2 text-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="self-start max-w-[80%] rounded-lg border px-4 py-3 space-y-3">
            {/* Explanation */}
            {explanation && (
                <div className="text-sm leading-relaxed">{explanation}</div>
            )}

            {/* Suggestions */}
            {suggestionText && (
                <div className="text-sm text-muted-foreground pt-2 space-y-1">
                    {suggestionText
                        .split(/(?=\d+\.)/)
                        .filter(Boolean)
                        .map((part, i) => {
                            const num = part.match(/^\d+\./)?.[0];
                            return (
                                <div key={i} className="flex gap-2">
                                    {num && (
                                        <span className="w-6 font-semibold text-muted-foreground/80">
                                            {num}
                                        </span>
                                    )}
                                    <span>{part.replace(/^\d+\./, "").trim()}</span>
                                </div>
                            );
                        })}
                </div>
            )}

            {/* Code Block */}
            {formattedCode && (
                <div className="pt-3 group">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-semibold text-green-600 tracking-wide">
                            FIXED CODE
                        </div>

                        <button
                            onClick={handleCopy}
                            className="
                h-7 w-7
                flex items-center justify-center
                rounded-md
                border border-green-500/30
                bg-green-500/10
                hover:bg-green-500/20
                opacity-0 group-hover:opacity-100
                transition
              "
                            title="Copy code"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <Copy className="h-4 w-4 text-green-500" />
                            )}
                        </button>
                    </div>

                    <CodeBlock code={formattedCode} lang="tsx" />
                </div>
            )}
        </div>
    );
}
