export async function translateText(
    text: string,
    targetLang: "ta" | "hi"
) {
    // placeholder for lingo.dev or any translation API
    // for now we mock the interface

    const response = await fetch("https://api.lingo.dev/translate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.LINGO_API_KEY}`,
        },
        body: JSON.stringify({
            text,
            targetLanguage: targetLang,
        }),
    });

    const data = await response.json();
    return data.translatedText;
}
