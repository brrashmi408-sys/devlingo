"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelect } from "@/components/LanguageSelect";

export function Header({ lang, onLangChange }: any) {
    return (
        <header className="w-full border-b border-border">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">

                {/* Logo + Text grouped together on the left */}
                <div className="flex items-center gap-0.5">  {/* ← this groups them */}
                    <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-full">
                        <Image
                            src="/devlingo.jpg"
                            alt="DevLingo"
                            fill
                            className="object-cover scale-150"   // or scale-150 etc. for more zoom
                            priority
                        />
                    </div>
                    <div className="font-bold text-xl">
                        ev<span className="text-green-500">Lingo</span>
                    </div>
                </div>

                {/* Right side stays as is */}
                <div className="flex items-center gap-2">
                    <LanguageSelect value={lang} onChange={onLangChange} />
                    <ThemeToggle />
                </div>

            </div>
        </header>
    );
}