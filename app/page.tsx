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
      const currentMessage = messages[index];
      
      if (currentMessage.content) {
        // Chat mode message - use fast translate API
        console.log("Translating chat message using fast /api/translate");
        
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: { explanation: currentMessage.content }, 
            lang: targetLang,
            useFastTranslation: true
          }),
        });

        const data = await res.json();
        console.log("Chat translation API response:", data);

        setMessages((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...currentMessage,
            content: data.explanation || currentMessage.content,
          };
          return updated;
        });
      } else {
        // Error mode message - use explain API with original error
        const originalError = currentMessage.sourceError || error;
        console.log("Translating error message using /api/explain with original error:", originalError);
        
        const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: originalError, lang: targetLang }),
        });

        const data = await res.json();
        console.log("Error translation API response:", data);

        setMessages((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...currentMessage,
            explanation: data.explanation,
            suggestion: data.suggestion,
            correctedCode: data.correctedCode,
          };
          return updated;
        });
      }
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
      // Chat mode - use chat API (always generates in English)
      console.log("Using chat mode for message:", error);
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: error, sessionId }),
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
    
    // Check for casual chat indicators in multiple languages (highest priority)
    const chatIndicators = [
      // English
      'hi', 'hello', 'hey', 'how are you', 'how\'s it going', 
      'what is', 'what are', 'can you', 'could you',
      'thanks', 'thank you', 'good morning', 'good afternoon',
      'good evening', 'bye', 'see you', 'talk to you later',
      
      // Hindi
      'नमस्ते', 'कैसे हो', 'आपका दिन कैसा चल रहा है', 'धन्यवाद',
      'शुभ प्रभात', 'शुभ संध्या', 'अलविदा', '�िर मिलेंगे',
      
      // Tamil
      'வணக்கம்', 'எப்படி இருக்கிறீர்கள்', 'நன்றி', 
      'காலை வணக்கம்', 'மாலை வணக்கம்',
      
      // Telugu
      'నమస్కారం', 'ఎలా ఉన్నారు', 'ధన్యవాదాలు',
      'శుభోదయం', 'శుభ సాయంత్రం',
      
      // Spanish
      'hola', 'cómo estás', 'gracias', 'buenos días', 
      'buenas tardes', 'buenas noches', 'adiós',
      
      // French
      'bonjour', 'comment allez-vous', 'merci', 'bon matin',
      'bon après-midi', 'bonne soirée', 'au revoir',
      
      // German
      'hallo', 'wie geht es dir', 'danke', 'guten morgen',
      'guten tag', 'guten abend', 'auf wiedersehen',
      
      // General conversation patterns
      'कैसा है', 'कैसी है', 'बताओ', 'बताइए', 'यह', 'यह एक', 'यह सामान्य'
    ];
    
    // Check if it's clearly a casual conversation
    const isCasualChat = chatIndicators.some(indicator => lowerInput.includes(indicator));
    
    // If any chat indicator is found, immediately return chat mode
    if (isCasualChat) {
      return "chat";
    }
    
    // Error indicators (only checked if no chat indicators found)
    const errorKeywords = [
      'error', 'exception', 'failed', 'cannot', 'undefined', 'null',
      'syntax error', 'typeerror', 'referenceerror', 'compile',
      'npm err', 'yarn error', 'git error', 'command not found',
      'module not found', 'dependency', 'port already', 'env',
      'त्रुटि', 'एरर', 'गलती' // Hindi error words
    ];
    
    // Check if input contains error indicators
    const hasErrorKeywords = errorKeywords.some(keyword => lowerInput.includes(keyword));
    
    // Check if it looks like code (has braces, semicolons, etc.)
    const hasCodeIndicators = /[{}();]/.test(input) || input.includes('import ') || input.includes('function');
    
    // Only use error mode if it has clear error indicators OR code patterns
    // AND it's not clearly a casual chat
    if (hasErrorKeywords || hasCodeIndicators) {
      return "error";
    }
    
    // Default to chat mode for safety
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
