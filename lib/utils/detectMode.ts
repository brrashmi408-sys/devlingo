export function detectMode(input: string): "error" | "chat" {
    const errorPatterns = [
        "error",
        "exception",
        "traceback",
        "undefined",
        "cannot",
        "failed",
        "syntax",
        "not found",
        "typeerror",
        "referenceerror",
        "stack trace"
    ];

    return errorPatterns.some(pattern =>
        input.toLowerCase().includes(pattern)
    )
        ? "error"
        : "chat";
}
