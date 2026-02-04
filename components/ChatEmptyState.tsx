"use client";

import { motion } from "framer-motion";
import { Code2, Terminal, Languages } from "lucide-react";

export function ChatEmptyState({
    title,
    description,
    examples,
}: {
    title: string;
    description: string;
    examples: {
        compilerTitle: string;
        compilerText: string;
        cliTitle: string;
        cliText: string;
        nativeTitle: string;
        nativeText: string;
    };
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center h-[60vh] px-6"
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mb-6"
            >
                <img
                    src="https://img.freepik.com/free-vector/stay-immune-threats-with-our-firewall-safety-technology_1017-51292.jpg"
                    alt="Developer-friendly error explanation"
                    className="mb-6 w-[60px] rounded-xl"
                />
            </motion.div>

            <h2 className="text-xl font-semibold mb-2">{title}</h2>

            <p className="text-sm text-muted-foreground max-w-md mb-8">
                {description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl w-full">
                <Example
                    icon={<Code2 className="h-5 w-5" />}
                    title={examples.compilerTitle}
                    text={examples.compilerText}
                />
                <Example
                    icon={<Terminal className="h-5 w-5" />}
                    title={examples.cliTitle}
                    text={examples.cliText}
                />
                <Example
                    icon={<Languages className="h-5 w-5" />}
                    title={examples.nativeTitle}
                    text={examples.nativeText}
                />
            </div>
        </motion.div>
    );
}

function Example({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-lg border bg-background p-4 text-left"
        >
            <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                {icon}
                {title}
            </div>
            <p className="text-xs text-muted-foreground">{text}</p>
        </motion.div>
    );
}
