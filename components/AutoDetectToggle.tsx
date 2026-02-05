"use client";

import { Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AutoDetectToggleProps {
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export function AutoDetectToggle({ enabled, onToggle }: AutoDetectToggleProps) {
    return (
        <div className="flex items-center gap-2">
            <motion.div
                className="relative"
                whileTap={{ scale: 0.95 }}
            >
                <button
                    onClick={() => onToggle(!enabled)}
                    className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${enabled 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }
                    `}
                >
                    <motion.span
                        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
                        animate={{
                            x: enabled ? 24 : 4
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                        }}
                    />
                </button>
            </motion.div>
            
            <div className="flex items-center gap-1">
                {enabled ? (
                    <Brain className="h-4 w-4 text-green-500" />
                ) : (
                    <Sparkles className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs font-medium text-muted-foreground">
                    {enabled ? "Smart" : "Basic"}
                </span>
            </div>
        </div>
    );
}
