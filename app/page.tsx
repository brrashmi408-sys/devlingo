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

  // auto-scroll like ChatGPT
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendError = async (error: string) => {
    if (!error.trim()) return;

    // 1️⃣ add user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: error },
    ]);

    setLoading(true);

    // 2️⃣ explain via Groq
    const explainRes = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error }),
    });

    let explainData = await explainRes.json();

    let explanation = explainData.explanation;
    let suggestion = explainData.suggestion;

    // 3️⃣ translate if needed
    if (lang !== "en") {
      const translateRes = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          text: { explanation, suggestion },
        }),
      });

      const translated = await translateRes.json();
      explanation = translated.explanation;
      suggestion = translated.suggestion;
    }

    // 4️⃣ add assistant message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        explanation,
        suggestion,
      },
    ]);

    setLoading(false);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header with language + theme */}
      <Header lang={lang} onLangChange={setLang} />

      {/* Chat messages */}
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

      {/* Fixed bottom input */}
      <ChatInput onSend={sendError} loading={loading} />
    </div>
  );
}
