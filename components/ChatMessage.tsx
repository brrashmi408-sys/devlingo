type Props = {
    role: "user" | "assistant";
    content?: string;
    explanation?: string;
    suggestion?: string;
};

export function ChatMessage({
    role,
    content,
    explanation,
    suggestion,
}: Props) {
    if (role === "user") {
        return (
            <div className="self-end max-w-[80%] rounded-lg bg-muted px-4 py-2 text-sm">
                {content}
            </div>
        );
    }

    return (
        <div className="self-start max-w-[80%] rounded-lg border px-4 py-3 space-y-2">
            <div className="text-sm">{explanation}</div>
            <div className="text-sm text-muted-foreground">
                💡 {suggestion}
            </div>
        </div>
    );
}
