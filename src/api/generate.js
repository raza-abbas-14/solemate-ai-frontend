// Vercel Serverless Function
// This runs on Vercel's backend — Replicate token is safe here
// Browser calls /api/generate → this calls Replicate → returns image

export default async function handler(req, res) {
  // Allow browser to call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const REPLICATE_TOKEN = process.env.VITE_REPLICATE_TOKEN;

  if (!REPLICATE_TOKEN) {
    return res.status(500).json({ error: 'Replicate token not configured' });
  }

  try {
    const { prompt, imageUrl } = req.body;

    // Start prediction
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf',
        input: {
          prompt: prompt,
          image: imageUrl,
          prompt_strength: 0.5,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          negative_prompt: 'deformed, ugly, blurry, low quality, cartoon, text, watermark',
        },
      }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      return res.status(500).json({ error: err });
    }

    const prediction = await startRes.json();

    // Poll for result (max 2 minutes)
    let result = prediction;
    for (let i = 0; i < 60; i++) {
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
        return res.status(500).json({ error: result.error || 'Generation failed' });
      }
    }

    return res.status(500).json({ error: 'Timeout' });

  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
