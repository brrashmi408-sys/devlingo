"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
    onExplain: (error: string) => void;
    loading: boolean;
};

export function ErrorInput({ onExplain, loading }: Props) {
    const [error, setError] = useState("");

    return (
        <div className="space-y-4">
            <Textarea
                placeholder="Paste your programming error here..."
                className="min-h-[140px] text-sm"
                value={error}
                onChange={(e) => setError(e.target.value)}
            />

            <Button
                onClick={() => onExplain(error)}
                disabled={!error || loading}
                className="bg-green-500 hover:bg-green-600 text-black"
            >
                {loading ? "Explaining..." : "Explain Error"}
            </Button>
        </div>
    );
}
