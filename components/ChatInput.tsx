"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function ChatInput({
    onSend,
    loading,
    placeholder,
}: {
    onSend: (value: string) => void;
    loading: boolean;
    placeholder: string;
}) {
    const [value, setValue] = useState("");

    const send = () => {
        if (!value.trim() || loading) return;
        onSend(value);
        setValue("");
    };

    return (
        <div className="bg-background pb-6">
            <div className="mx-auto max-w-3xl flex items-center gap-2">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            send();
                        }
                    }}
                    placeholder={placeholder}
                    className="h-12 rounded-full px-4"
                />

                <Button
                    onClick={send}
                    disabled={loading}
                    className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 text-black p-0"
                >
                    <Send size={18} />
                </Button>
            </div>
        </div>
    );
}
