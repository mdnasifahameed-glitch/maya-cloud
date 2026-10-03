export default function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;

  return res.status(200).json({
    functionWorking: true,
    openAIKeyConfigured: Boolean(key),
    keyLength: key ? key.length : 0
  });
}
