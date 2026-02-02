type Props = {
    language: string;
    explanation: string;
    suggestion: string;
    translatedExplanation?: string;
    translatedSuggestion?: string;
};

export function ResponseCard({
    language,
    explanation,
    suggestion,
    translatedExplanation,
    translatedSuggestion,
}: Props) {
    return (
        <div className="mt-6 space-y-4 rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">
                Detected language: <span className="font-medium">{language}</span>
            </div>

            <div>
                <h3 className="font-semibold mb-1">Explanation</h3>
                <p className="text-sm text-muted-foreground">
                    {translatedExplanation || explanation}
                </p>
            </div>

            <div>
                <h3 className="font-semibold mb-1">Suggestion</h3>
                <p className="text-sm text-muted-foreground">
                    {translatedSuggestion || suggestion}
                </p>
            </div>
        </div>
    );
}
