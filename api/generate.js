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

    // Use FLUX Schnell - correct endpoint
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
      return res.status(500).json({ error: `Replicate failed: ${err}` });
    }

    const prediction = await startRes.json();
    let result = prediction;

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        { headers: { 'Authorization': `Token ${REPLICATE_TOKEN}` } }
      );
      result = await pollRes.json();
      if (result.status === 'succeeded') {
        const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
        return res.status(200).json({ success: true, imageUrl });
      }
      if (result.status === 'failed') {
        return res.status(500).json({ error: result.error || 'Failed' });
      }
    }

    return res.status(500).json({ error: 'Timeout' });

  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
