import en from "@/i18n/en.json";
import hi from "@/i18n/hi.json";
import kn from "@/i18n/kn.json";
import ta from "@/i18n/ta.json";
import te from "@/i18n/te.json";
import ml from "@/i18n/ml.json";
import fr from "@/i18n/fr.json";
import es from "@/i18n/es.json";
import de from "@/i18n/de.json";

const dictionaries: Record<string, any> = {
    en,
    hi,
    kn,
    ta,
    te,
    ml,
    fr,
    es,
    de,
};

export function getT(lang: string) {
    return dictionaries[lang] || dictionaries.en;
}
