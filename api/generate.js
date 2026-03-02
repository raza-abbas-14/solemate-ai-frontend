export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const HF_TOKEN = process.env.VITE_HUGGINGFACE_TOKEN;
  if (!HF_TOKEN) return res.status(500).json({ error: 'No Hugging Face token found in Vercel' });

  try {
    const { prompt } = req.body;

    // Call the exact same FLUX model, but on Hugging Face's NEW router URL
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64Image}`;

    return res.status(200).json({ success: true, imageUrl: imageUrl });

  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}