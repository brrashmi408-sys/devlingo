"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelect } from "@/components/LanguageSelect";
import { type SupportedLang } from "@/lib/i18n/languages";

interface HeaderProps {
    lang: SupportedLang;
    onLangChange: (newLang: SupportedLang) => void;
}

export function Header({ lang, onLangChange }: HeaderProps) {
    return (
        <header className="w-full border-b border-border">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">

                {/* Logo + Brand */}
                <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9 shrink-0 overflow-hidden rounded-full">
                        <Image
                            src="/devlingo.jpg"
                            alt="DevLingo logo"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <motion.div
                        className="font-bold text-lg sm:text-xl tracking-tight"
                        initial={{ x: -40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.3,
                            ease: [0.34, 1.56, 0.64, 1],
                        }}
                    >
                        ev<span className="text-green-500">Lingo</span>
                    </motion.div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <LanguageSelect value={lang} onChange={onLangChange} />
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
