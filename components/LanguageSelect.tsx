"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LANG_OPTIONS, type SupportedLang } from "@/lib/i18n/languages";

type Props = {
    value: SupportedLang;
    onChange: (value: SupportedLang) => void;
};

export function LanguageSelect({ value, onChange }: Props) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px] [&>svg]:hidden">
                <SelectValue placeholder="Language" />
            </SelectTrigger>

            <SelectContent
                position="popper"
                side="bottom"
                align="end"
                className="max-h-60 overflow-y-auto"
            >
                {LANG_OPTIONS.map(({ code, label }) => (
                    <SelectItem key={code} value={code}>
                        {label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
