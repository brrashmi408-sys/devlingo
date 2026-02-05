"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Languages, Brain } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { type SupportedLang } from "@/lib/i18n/languages";

/* -------- SIMPLE CODE FORMATTER -------- */

function formatCode(code: string): string {
    if (!code) return code;

    // If code already has proper formatting, just normalize indentation
    if (code.includes('\n')) {
        return normalizeIndentation(code);
    }

    // For single-line code, try to add basic structure
    return formatSingleLine(code);
}

function formatSingleLine(code: string): string {
    // Don't format if it's just a simple statement
    if (!code.includes('{') && !code.includes('}')) {
        return code;
    }

    // Add line breaks for braces
    let formatted = code;

    // Handle opening braces
    formatted = formatted.replace(/{\s*/g, ' {\n  ');

    // Handle closing braces  
    formatted = formatted.replace(/\s*}/g, '\n}');

    // Handle semicolons in multi-line contexts
    formatted = formatted.replace(/;\s*/g, ';\n  ');

    return normalizeIndentation(formatted);
}

function normalizeIndentation(code: string): string {
    const lines = code.split('\n');
    let indentLevel = 0;
    const result: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Skip empty lines but keep them
        if (line === '') {
            result.push('');
            continue;
        }

        // Decrease indent for closing braces
        if (line.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        // Add current line with proper indentation
        result.push('  '.repeat(indentLevel) + line);

        // Increase indent for opening braces
        if (line.endsWith('{')) {
            indentLevel++;
        }

        // Handle else statements - decrease then increase
        if (line.startsWith('else') && !line.includes('{')) {
            indentLevel = Math.max(0, indentLevel - 1);
            result[result.length - 1] = '  '.repeat(indentLevel) + line;
            indentLevel++;
        }
    }

    return result.join('\n');
}

/* -------- SUGGESTION RENDER -------- */

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
        });
}

/* -------- TYPES -------- */

type AppMode = "error" | "chat";

type Props = {
    index: number;
    role: "user" | "assistant";
    content?: string;
    explanation?: string;
    suggestion?: any;
    correctedCode?: string;

    sourceError?: string;
    detectedCategory?: string;

    onTranslate?: (
        index: number,
        error: string,
        lang: SupportedLang
    ) => void;

    availableLangs?: { code: string; label: string }[];
    mode?: AppMode;
};

/* -------- COMPONENT -------- */

export function ChatMessage({
    index,
    role,
    content,
    explanation,
    suggestion,
    correctedCode,
    sourceError,
    detectedCategory,
    onTranslate,
    availableLangs = [],
    mode,
}: Props) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [formattedCode, setFormattedCode] = useState("");

    useEffect(() => {
        if (correctedCode) {
            const formatted = formatCode(correctedCode);
            setFormattedCode(formatted);
        } else {
            setFormattedCode("");
        }
    }, [correctedCode]);

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

            {/* CATEGORY BADGE */}
            {detectedCategory && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                    <Brain className="h-3 w-3" />
                    {detectedCategory} Error
                </div>
            )}

            {/* TRANSLATE - Available for both modes */}
            {console.log("ChatMessage Debug - role:", role, "mode:", mode, "onTranslate:", !!onTranslate, "condition:", role === "assistant" && onTranslate)}
            {role === "assistant" && onTranslate && (
                <div className="absolute top-2 right-2">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-background border rounded px-2 py-1"
                    >
                        <Languages className="h-4 w-4" />
                        Translate
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-1 w-40 rounded-md border bg-background shadow-lg z-50 max-h-48 overflow-y-auto">
                            {availableLangs.map(l => (
                                <button
                                    key={l.code}
                                    onClick={() => {
                                        setOpen(false);
                                        onTranslate(index, content || "", l.code as SupportedLang);
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

            {content && (
                <div className="mt-8 text-sm">
                    {content}
                </div>
            )}

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
