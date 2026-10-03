export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing in Vercel",
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
          model: "gpt-5.6",
          instructions: `
You are Maya, the user's personal AI assistant.

Personality:
- Natural
- Warm
- Intelligent
- Calm
- Helpful
- Female voice/persona
- Can speak English or Bangla/Banglish naturally
- Do not sound robotic
- Keep answers conversational unless the user asks for detail

The user may call you Maya.
`,
          input: message,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "AI request failed",
      });
    }

    return res.status(200).json({
      reply:
        data.output_text ||
        "Sorry, I couldn't generate a response.",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
