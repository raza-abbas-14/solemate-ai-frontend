// Just STARTS the Replicate prediction and returns the ID
// Browser then polls Replicate directly for the result
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const REPLICATE_TOKEN = process.env.VITE_REPLICATE_TOKEN;
  if (!REPLICATE_TOKEN) return res.status(500).json({ error: 'No token' });

  try {
    const { prompt } = req.body;

    const startRes = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          num_outputs: 1,
          output_format: 'webp',
          output_quality: 80,
        },
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      return res.status(500).json({ error: err });
    }

    const prediction = await startRes.json();
    // Return prediction ID immediately — browser will poll
    return res.status(200).json({ 
      success: true, 
      predictionId: prediction.id,
      token: REPLICATE_TOKEN
    });

  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
