"use client";

import { Bug, MessageCircle } from "lucide-react";
import { Tooltip } from "antd";

type AppMode = "error" | "chat";

interface ModeToggleProps {
    mode: AppMode;
    onModeChange: (mode: AppMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">

            {/* ERROR MODE */}
            <Tooltip title="Error Mode">
                <button
                    onClick={() => onModeChange("error")}
                    className={`
            flex items-center justify-center p-2 rounded-md transition-all
            ${mode === "error"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }
          `}
                >
                    <Bug className="h-5 w-5" />
                </button>
            </Tooltip>

            {/* CHAT MODE */}
            <Tooltip title="Chat Mode">
                <button
                    onClick={() => onModeChange("chat")}
                    className={`
            flex items-center justify-center p-2 rounded-md transition-all
            ${mode === "chat"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }
          `}
                >
                    <MessageCircle className="h-5 w-5" />
                </button>
            </Tooltip>

        </div>
    );
}

export type { AppMode };
