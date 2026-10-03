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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing",
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },

        body: JSON.stringify({
          model: "gpt-6-astra",

          instructions: `
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
Give detailed answers when the user asks for detail.
`,

          input: message,
        }),
      }
    );

    const data = await response.json();

    console.log("OPENAI STATUS:", response.status);
    console.log("OPENAI RESPONSE:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed",
      });
    }

    return res.status(200).json({
      reply:
        data.output_text ||
        "Maya received your message but did not return text.",
    });

  } catch (error) {
    console.error("MAYA SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
