"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Languages } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { type SupportedLang } from "@/lib/i18n/languages";

function formatCode(code: string) {
    if (!code.includes("\n")) {
        return code
            .replace(/{/g, "{\n    ")
            .replace(/;/g, ";\n    ")
            .replace(/}/g, "\n}");
    }
    return code;
}

function renderSuggestions(suggestion: any) {
    const text =
        typeof suggestion === "string"
            ? suggestion
            : Array.isArray(suggestion)
                ? suggestion.join(" ")
                : suggestion
                    ? String(suggestion)
                    : "";

    if (!text) return null;

    return text
        .split(/(?=\d+\.)/) // split before "1. 2. 3."
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
        });
}


type Props = {
    index: number;
    role: "user" | "assistant";
    content?: string;
    explanation?: string;
    suggestion?: any;
    correctedCode?: string;

    sourceError?: string;
    onTranslate?: (index: number, error: string, lang: SupportedLang) => void;
    availableLangs?: { code: string; label: string }[];
};

export function ChatMessage({
    index,
    role,
    content,
    explanation,
    suggestion,
    correctedCode,
    sourceError,
    onTranslate,
    availableLangs = [],
}: Props) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const formattedCode = useMemo(
        () => (correctedCode ? formatCode(correctedCode) : ""),
        [correctedCode]
    );

    const handleCopy = async () => {
        if (!formattedCode) return;
        await navigator.clipboard.writeText(formattedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    if (role === "user") {
        return (
            <div className="self-end max-w-[80%] rounded-lg bg-muted px-4 py-2 text-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="self-start max-w-[80%] rounded-lg border px-4 py-3 space-y-3 relative">
            {/* 🌍 Translate Dropdown */}
            {sourceError && onTranslate && (
                <div className="absolute top-2 right-2">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Languages className="h-4 w-4" />
                        Translate
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-1 w-36 rounded-md border bg-background shadow-lg z-50">
                            {availableLangs.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => {
                                        setOpen(false);
                                        onTranslate(index, sourceError, l.code as SupportedLang);
                                    }}
                                    className="block w-full px-3 py-2 text-left text-xs hover:bg-muted"
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {explanation && <div className="text-sm mt-4">{explanation}</div>}

            {suggestion && (
                <div className="text-sm text-muted-foreground pt-2 space-y-1">
                    {renderSuggestions(suggestion)}
                </div>
            )}

            {formattedCode && (
                <div className="pt-3 group">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-xs font-semibold text-green-600">
                            FIXED CODE
                        </div>

                        <button
                            onClick={handleCopy}
                            className="h-7 w-7 flex items-center justify-center rounded-md border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 opacity-0 group-hover:opacity-100 transition"
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
