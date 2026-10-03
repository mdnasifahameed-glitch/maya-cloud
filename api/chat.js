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
          model: "gpt-6-luna",

          instructions: `
You are Maya, a personal AI assistant.

You are warm, intelligent, calm and natural.
Speak naturally like a real female personal assistant.
The user can speak English, Bangla, or Banglish.
Reply in the same language the user uses.

Do not introduce yourself unnecessarily.
Do not repeat the user's question.
Be concise for simple requests and detailed when needed.
`,

          input: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed",
      });
    }

    return res.status(200).json({
      reply:
        data.output_text ||
        "I received your message but couldn't generate a response.",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
