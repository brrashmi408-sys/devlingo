"use client";

import { useEffect, useState } from "react";
import { createHighlighter, bundledThemes } from "shiki";

type Props = {
  code: string;
  lang?: string;
};

export function CodeBlock({ code, lang = "tsx" }: Props) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    async function load() {
      const highlighter = await createHighlighter({
        themes: [bundledThemes["dark-plus"]],
        langs: [lang],
      });

      const result = highlighter.codeToHtml(code, {
        lang,
        theme: "dark-plus",
      });

      setHtml(result);
    }

    load();
  }, [code, lang]);

  return (
    <div
      className="
        relative
        rounded-lg
        overflow-x-auto
        text-sm
        leading-relaxed
        [&>pre]:p-4
        [&>pre]:m-0
        [&>pre]:bg-[#1e1e1e]
        [&>pre]:font-mono
      "
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
