"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatEmptyState } from "@/components/ChatEmptyState";
import { ModeToggle, type AppMode } from "@/components/ModeToggle";
import { getT } from "@/lib/i18n";
import { LANG_OPTIONS, type SupportedLang } from "@/lib/i18n/languages";

type Message = {
  role: "user" | "assistant";
  content?: string;
  explanation?: string;
  suggestion?: string;
  correctedCode?: string;
  sourceError?: string;
  detectedCategory?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<SupportedLang>("en");
  const [mode, setMode] = useState<AppMode>("error");
  const [useAutoDetect, setUseAutoDetect] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}`);

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

    console.log("reTranslate called - index:", index, "targetLang:", targetLang);
    
    setLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error, lang: targetLang }),
      });

      const data = await res.json();
      console.log("Translation API response:", data);

      setMessages((prev) => {
        const updated = [...prev];
        const currentMessage = updated[index];
        
        // Check if this is a chat message (has content) or error message (has explanation)
        if (currentMessage.content) {
          // Chat mode message - update content field
          updated[index] = {
            ...currentMessage,
            content: data.explanation || data.response || "Translation failed",
          };
          console.log("Updated chat message content:", updated[index].content);
        } else {
          // Error mode message - update error fields
          updated[index] = {
            ...currentMessage,
            explanation: data.explanation,
            suggestion: data.suggestion,
            correctedCode: data.correctedCode,
            sourceError: error,
          };
          console.log("Updated error message fields");
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const sendError = async (error: string) => {
    if (!error.trim() || loading) return;

    // Auto-detect mode based on input
    const detectedMode = detectMode(error);
    if (detectedMode !== mode) {
      setMode(detectedMode);
    }

    setMessages((prev) => [...prev, { role: "user", content: error }]);
    setLoading(true);

    if (detectedMode === "error") {
      // Error mode - use existing error explanation
      const endpoint = useAutoDetect ? "/api/explain-auto" : "/api/explain";
      
      const res = await fetch(endpoint, {
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
          detectedCategory: data.detectedCategory,
        },
      ]);
    } else {
      // Chat mode - use chat API
      console.log("Using chat mode for message:", error);
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error, sessionId, lang }),
      });

      const data = await res.json();
      console.log("Chat API response:", data);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ]);
    }

    setLoading(false);
  };

  // Auto-detect mode based on user input
  function detectMode(input: string): AppMode {
    const lowerInput = input.toLowerCase().trim();
    
    // Check for casual chat indicators first (higher priority)
    const chatIndicators = [
      'hi', 'hello', 'hey', 'how are you', 'how\'s it going', 
      'what is', 'what are', 'can you', 'could you',
      'thanks', 'thank you', 'good morning', 'good afternoon',
      'good evening', 'bye', 'see you', 'talk to you later'
    ];
    
    // Check if it's clearly a casual conversation
    const isCasualChat = chatIndicators.some(indicator => lowerInput.includes(indicator));
    
    if (isCasualChat) {
      return "chat";
    }
    
    // Error indicators (lower priority now)
    const errorKeywords = [
      'error', 'exception', 'failed', 'cannot', 'undefined', 'null',
      'syntax error', 'typeerror', 'referenceerror', 'compile',
      'npm err', 'yarn error', 'git error', 'command not found',
      'module not found', 'dependency', 'port already', 'env'
    ];
    
    // Check if input contains error indicators
    const hasErrorKeywords = errorKeywords.some(keyword => lowerInput.includes(keyword));
    
    // Check if it looks like code (has braces, semicolons, etc.)
    const hasCodeIndicators = /[{}();]/.test(input) || input.includes('import ') || input.includes('function');
    
    // Only use error mode if it has clear error indicators OR code patterns
    // AND it's not clearly a casual chat
    if ((hasErrorKeywords || hasCodeIndicators) && !isCasualChat) {
      return "error";
    }
    
    // Otherwise, use chat mode
    return "chat";
  }

  return (
    <div className="flex h-screen flex-col">
      <Header 
        lang={lang} 
        onLangChange={setLang} 
        useAutoDetect={useAutoDetect}
        onAutoDetectToggle={setUseAutoDetect}
      />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl flex flex-col gap-4">
          {messages.length === 0 ? (
            <ChatEmptyState
              title={mode === "error" ? t.welcome_title : "Start a Conversation"}
              description={
                mode === "error" 
                  ? t.welcome_description 
                  : "Ask me anything! I can help with coding, debugging, or general questions."
              }
              examples={
                mode === "error" ? {
                  compilerTitle: t.empty_compiler_title,
                  compilerText: t.empty_compiler_example,
                  cliTitle: t.empty_cli_title,
                  cliText: t.empty_cli_example,
                  nativeTitle: t.empty_native_title,
                  nativeText: t.empty_native_example,
                } : undefined
              }
            />
          ) : (
            messages.map((msg, index) => (
              <ChatMessage
                key={index}
                index={index}
                {...msg}
                mode={mode}
                onTranslate={reTranslate}
                availableLangs={LANG_OPTIONS}
              />
            ))
          )}

          {loading && (
            <div className="text-sm text-muted-foreground">
              {mode === "error" ? t.thinking : "Thinking..."}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      <ChatInput
        onSend={sendError}
        loading={loading}
        placeholder={
          mode === "error" 
            ? t.chat_input_placeholder 
            : "Ask me anything..."
        }
        mode={mode}
        onModeChange={setMode}
      />
    </div>
  );
}
