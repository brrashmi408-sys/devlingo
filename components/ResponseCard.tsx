type Props = {
    explanation: string;
    suggestion: string;
};

export function ResponseCard({ explanation, suggestion }: Props) {
    return (
        <div className="self-start max-w-[80%] rounded-lg border px-4 py-3 space-y-2">
            <p className="text-sm">{explanation}</p>
            <p className="text-sm text-muted-foreground">
                💡 {suggestion}
            </p>
        </div>
    );
}
