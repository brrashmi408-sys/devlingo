"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatEmptyState } from "@/components/ChatEmptyState";

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

  // Auto-scroll like ChatGPT
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // 🔥 FIXED sendError with correctedCode
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
        setMessages((prev) => [...prev, {
          role: "assistant",
          explanation: data.explanation,
          suggestion: data.suggestion,
          correctedCode: data.correctedCode,  // ✅ NOW WORKS!
        }]);
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (err) {
      console.error("sendError error:", err);
      setMessages((prev) => [...prev, {
        role: "assistant",
        explanation: "Sorry, couldn't process that error right now.",
        suggestion: "Try again or check your connection.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Remove translateLastAssistantMessage - no longer needed!
  // Single API call handles everything

  return (
    <div className="flex h-screen flex-col">
      <Header
        lang={lang}
        onLangChange={(newLang) => setLang(newLang)}  // Simplified
      />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {messages.length === 0 && !loading ? (
            <ChatEmptyState />
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} {...msg} />
            ))
          )}

          {loading && (
            <div className="self-start rounded-lg border px-4 py-2 text-sm text-muted-foreground">
              DevLingo is thinking…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <ChatInput onSend={sendError} loading={loading} />
    </div>
  );
}
