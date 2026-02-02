"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    value: string;
    onChange: (value: string) => void;
};

export function LanguageSelect({ value, onChange }: Props) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-[180px] justify-between">
                <SelectValue placeholder="Language" />
            </SelectTrigger>

            {/* Opens BELOW the trigger */}
            <SelectContent
                position="popper"
                side="bottom"
                align="end"
                className="max-h-72"
            >
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                <SelectItem value="ta">🇮🇳 Tamil</SelectItem>
                <SelectItem value="te">🇮🇳 Telugu</SelectItem>
                <SelectItem value="kn">🇮🇳 Kannada</SelectItem>
                <SelectItem value="ml">🇮🇳 Malayalam</SelectItem>
                <SelectItem value="fr">🇫🇷 French</SelectItem>
                <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                <SelectItem value="de">🇩🇪 German</SelectItem>
            </SelectContent>
        </Select>
    );
}
