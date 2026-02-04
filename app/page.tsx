"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { getT } from "@/lib/i18n";

type Message = {
  role: "user" | "assistant";
  content?: string;
  explanation?: string;
  suggestion?: string;
  correctedCode?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");

  const bottomRef = useRef<HTMLDivElement>(null);
  const t = getT(lang);

  useEffect(() => {
    const savedLang = localStorage.getItem("devlingo-lang");
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendError = async (error: string) => {
    if (!error.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: error }]);
    setLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, lang }),
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            explanation: data.explanation,
            suggestion: data.suggestion,
            correctedCode: data.correctedCode,
          },
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          explanation: t.fallback_error,
          suggestion: t.fallback_suggestion,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLangChange = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("devlingo-lang", newLang);
  };

  return (
    <div className="flex h-screen flex-col">
      <Header lang={lang} onLangChange={handleLangChange} />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {messages.length === 0 && !loading ? (
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
              <ChatMessage key={index} {...msg} />
            ))
          )}

          {loading && (
            <div className="self-start rounded-lg border px-4 py-2 text-sm text-muted-foreground">
              {t.thinking}
            </div>
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
