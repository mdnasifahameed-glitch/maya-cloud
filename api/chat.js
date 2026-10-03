export default async function handler(req, res) {
  return res.status(200).json({
    functionWorking: true,
    openAIKeyConfigured: Boolean(process.env.OPENAI_API_KEY),
    environment: process.env.VERCEL_ENV || "unknown",
  });
}
