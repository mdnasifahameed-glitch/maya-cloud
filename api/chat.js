export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing",
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: `
You are Maya, a personal AI assistant.

You are warm, intelligent, calm and natural.

The user may speak:
- English
- Bangla
- Banglish

Always reply in the same language the user uses.

Be natural and conversational.
Do not unnecessarily introduce yourself.
Do not repeat the user's question.
Keep simple answers concise.
Give detailed answers when needed.

You are Maya, not Gemini.
                `,
              },
            ],
          },

          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    console.log("GEMINI STATUS:", response.status);
    console.log("GEMINI RESPONSE:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Gemini request failed",
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim();

    return res.status(200).json({
      reply:
        reply ||
        "Maya received your message but did not return text.",
    });

  } catch (error) {
    console.error("MAYA SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
