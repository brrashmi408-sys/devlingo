export type ErrorCategory =
    | "cli"
    | "compiler"
    | "runtime"
    | "environment"
    | "general";

export function classifyError(input: string): ErrorCategory {
    const text = input.toLowerCase();

    /* CLI Errors */
    if (
        text.includes("command not found") ||
        text.includes("npm") ||
        text.includes("yarn") ||
        text.includes("pnpm") ||
        text.includes("git") ||
        text.includes("terminal")
    ) {
        return "cli";
    }

    /* Compiler Errors */
    if (
        text.includes("syntax error") ||
        text.includes("compile") ||
        text.includes("unexpected token") ||
        text.includes("typeerror") ||
        text.includes("referenceerror")
    ) {
        return "compiler";
    }

    /* Runtime Errors */
    if (
        text.includes("undefined") ||
        text.includes("null") ||
        text.includes("cannot read") ||
        text.includes("is not a function")
    ) {
        return "runtime";
    }

    /* Environment Errors */
    if (
        text.includes("module not found") ||
        text.includes("dependency") ||
        text.includes("env") ||
        text.includes("port already in use")
    ) {
        return "environment";
    }

    return "general";
}
