"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelect } from "@/components/LanguageSelect";

interface HeaderProps {
    lang: string;
    onLangChange: (newLang: string) => void;
}

export function Header({ lang, onLangChange }: HeaderProps) {
    return (
        <header className="w-full border-b border-border">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                <div className="flex items-center gap-0.3">
                    <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-full">
                        <Image
                            src="/devlingo.jpg"
                            alt="DevLingo"
                            fill
                            className="object-cover scale-150"
                            priority
                        />
                    </div>

                    <motion.div
                        className="font-bold text-xl"
                        initial={{ x: -60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.8,
                            delay: 0.45,               // ← starts after logo "settles"
                            ease: [0.34, 1.56, 0.64, 1], // nice overshoot / bounce
                        }}
                    >
                        ev<span className="text-green-500">Lingo</span>
                    </motion.div>
                </div>

                <div className="flex items-center gap-2">
                    <LanguageSelect value={lang} onChange={onLangChange} />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}