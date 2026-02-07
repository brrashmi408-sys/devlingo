// lib/translator/chatTranslator.ts

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function translateChatMessage(text: string, targetLang: string): Promise<string> {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    const langMap: { [key: string]: string } = {
        hi: "Hindi",
        ta: "Tamil", 
        te: "Telugu",
        kn: "Kannada",
        ml: "Malayalam",
        es: "Spanish",
        fr: "French",
        de: "German",
        it: "Italian",
        pt: "Portuguese"
    };

    const targetLanguage = langMap[targetLang] || targetLang;

    const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 500,
            messages: [
                {
                    role: "system",
                    content: `You are a fast translator. Translate the given text to ${targetLanguage}. 
                    Only return the translated text, no explanations or extra content. 
                    Keep the translation natural and conversational.`
                },
                {
                    role: "user",
                    content: text
                }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content;

    if (!translatedText) {
        throw new Error("Empty translation response");
    }

    return translatedText.trim();
}
