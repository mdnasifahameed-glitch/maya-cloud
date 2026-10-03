export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
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
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },

        body: JSON.stringify({
          model: "gemini-3.5-flash-lite",

          input: message.trim(),

          system_instruction: `
You are Maya, a personal AI assistant.

Personality:
- warm
- intelligent
- calm
- natural
- helpful
- concise when appropriate

The user may speak English, Bangla, or Banglish.

Always answer in the same language/style the user uses.

If the user speaks Bangla, answer in Bangla.
If the user speaks Banglish, answer naturally in Banglish.
If the user speaks English, answer in English.

Do not unnecessarily introduce yourself.
Do not repeat the user's question.
Do not mention Gemini.
You are Maya.

For simple questions, keep the answer concise.
For complex questions, explain clearly and completely.
          `,
        }),
      }
    );

    const data = await response.json();

    console.log("GEMINI STATUS:", response.status);
    console.log("GEMINI RESPONSE:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.message ||
          "Gemini request failed",
      });
    }

    // Current Interactions API response:
    // steps -> model_output -> content -> text

    let reply = "";

    if (Array.isArray(data?.steps)) {
      for (const step of data.steps) {
        if (
          step?.type === "model_output" &&
          Array.isArray(step.content)
        ) {
          for (const content of step.content) {
            if (
              content?.type === "text" &&
              typeof content.text === "string"
            ) {
              reply += content.text;
            }
          }
        }
      }
    }

    // Compatibility fallback
    if (!reply && typeof data?.output_text === "string") {
      reply = data.output_text;
    }

    if (!reply && Array.isArray(data?.outputs)) {
      reply = data.outputs
        .filter((item) => item?.type === "text")
        .map((item) => item.text || "")
        .join("");
    }

    reply = reply.trim();

    if (!reply) {
      console.error(
        "NO TEXT FOUND IN GEMINI RESPONSE:",
        JSON.stringify(data)
      );

      return res.status(502).json({
        error: "Gemini returned no text response.",
      });
    }

    return res.status(200).json({
      reply,
    });

  } catch (error) {
    console.error("MAYA SERVER ERROR:", error);

    return res.status(500).json({
      error: error?.message || "Server error",
    });
  }
}
