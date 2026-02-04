"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { getT } from "@/lib/i18n";
import { LANG_OPTIONS, type SupportedLang } from "@/lib/i18n/languages";

type Message = {
  role: "user" | "assistant";
  content?: string;
  explanation?: string;
  suggestion?: string;
  correctedCode?: string;
  sourceError?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<SupportedLang>("en");

  const bottomRef = useRef<HTMLDivElement>(null);
  const t = getT(lang);

  useEffect(() => {
    const savedLang = localStorage.getItem("devlingo-lang");
    if (savedLang) setLang(savedLang as SupportedLang);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔥 TRANSLATE & REPLACE SAME MESSAGE
  const reTranslate = async (
    index: number,
    error: string,
    targetLang: SupportedLang
  ) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, lang: targetLang }),
      });

      const data = await res.json();

      setMessages((prev) => {
        const updated = [...prev];
        updated[index] = {
          role: "assistant",
          explanation: data.explanation,
          suggestion: data.suggestion,
          correctedCode: data.correctedCode,
          sourceError: error,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const sendError = async (error: string) => {
    if (!error.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: error }]);
    setLoading(true);

    const res = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error, lang }),
    });

    const data = await res.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        explanation: data.explanation,
        suggestion: data.suggestion,
        correctedCode: data.correctedCode,
        sourceError: error,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header lang={lang} onLangChange={setLang} />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {messages.length === 0 ? (
            <ChatEmptyState
              title={t.welcome_title}
              description={t.welcome_description}
              examples={{
                compilerTitle: t.empty_compiler_title,
                compilerText: t.empty_compiler_example,
                cliTitle: t.empty_cli_title,
                cliText: t.empty_cli_example,
                nativeTitle: t.empty_native_title,
                nativeText: t.empty_native_example,
              }}
            />
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                index={index}
                {...msg}
                onTranslate={reTranslate}
                availableLangs={LANG_OPTIONS}
              />
            ))
          )}

          {loading && (
            <div className="text-sm text-muted-foreground">{t.thinking}</div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <ChatInput
        onSend={sendError}
        loading={loading}
        placeholder={t.chat_input_placeholder}
      />
    </div>
  );
}
