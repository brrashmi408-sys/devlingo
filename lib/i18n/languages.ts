export const SUPPORTED_LANGS = {
    en: "English",
    hi: "Hindi",
    kn: "Kannada",
    ml: "Malayalam",
    ta: "Tamil",
    te: "Telugu",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
} as const;

export type SupportedLang = keyof typeof SUPPORTED_LANGS;

export const LANG_OPTIONS = Object.entries(SUPPORTED_LANGS).map(
    ([code, label]) => ({
        code,
        label,
    })
);
