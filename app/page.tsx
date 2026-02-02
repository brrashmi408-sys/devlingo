"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";

type Message = {
  role: "user" | "assistant";
  content?: string;
  explanation?: string;
  suggestion?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll like ChatGPT
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔹 Send error (ALWAYS English first)
  const sendError = async (error: string) => {
    if (!error.trim() || loading) return;

    // User message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: error },
    ]);

    setLoading(true);

    // Explain via Groq
    const explainRes = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error }),
    });

    const explainData = await explainRes.json();

    // Assistant message (English canonical)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        explanation: explainData.explanation,
        suggestion: explainData.suggestion,
      },
    ]);

    setLoading(false);
  };

  // 🔹 Translate ONLY the last assistant message
  const translateLastAssistantMessage = async (language: string) => {
    if (language === "en" || loading) return;

    setLoading(true);

    const lastAssistantIndex = [...messages]
      .map((m, i) => ({ m, i }))
      .reverse()
      .find((x) => x.m.role === "assistant")?.i;

    if (lastAssistantIndex === undefined) {
      setLoading(false);
      return;
    }

    const last = messages[lastAssistantIndex];

    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: language,
        text: {
          explanation: last.explanation,
          suggestion: last.suggestion,
        },
      }),
    });

    const translated = await res.json();

    setMessages((prev) => {
      const updated = [...prev];
      updated[lastAssistantIndex] = {
        ...last,
        explanation: translated.explanation,
        suggestion: translated.suggestion,
      };
      return updated;
    });

    setLoading(false);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <Header
        lang={lang}
        onLangChange={(newLang) => {
          setLang(newLang);
          translateLastAssistantMessage(newLang);
        }}
      />

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {messages.map((msg, index) => (
            <ChatMessage key={index} {...msg} />
          ))}

          {loading && (
            <div className="self-start rounded-lg border px-4 py-2 text-sm text-muted-foreground">
              DevLingo is thinking…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Chat Input */}
      <ChatInput onSend={sendError} loading={loading} />
    </div>
  );
}
