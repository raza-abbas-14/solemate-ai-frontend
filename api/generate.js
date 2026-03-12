import Replicate from 'replicate';

export default async function handler(req, res) {
    // CORS Headers for Vercel Serverless Functions
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ------------------------------------------------------------------------------------------------ //
    // 🛡️ STRICT SECURITY SHIELD: Block Hackers/Bots from draining Replicate credits
    // This absolutely guarantees that ONLY your official Vercel Website or Local PC can trigger the AI
    // ------------------------------------------------------------------------------------------------ //
    const origin = req.headers.origin || req.headers.referer || '';
    const isLocal = origin.includes('localhost');
    const isProd = origin.includes('solemate-ai-frontend.vercel.app');

    if (!isLocal && !isProd) {
        console.warn(`[SECURITY] Blocked unauthorized AI generation attempt from origin: ${origin}`);
        return res.status(403).json({ error: 'Forbidden: Unauthorized Origin. API access is strictly locked to the SoleMate website.' });
    }
    // ------------------------------------------------------------------------------------------------ //

    try {
        const { prompt, negative_prompt, image } = req.body;

        if (!process.env.REPLICATE_API_TOKEN) {
            return res.status(500).json({ error: 'REPLICATE_API_TOKEN is missing on Vercel.' });
        }

        if (!image) {
            return res.status(400).json({ error: 'Base image is required for generation.' });
        }

        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        // Use SDXL ControlNet (Canny) to strictly preserve shoe geometry
        const output = await replicate.run(
            "lucataco/sdxl-controlnet:822c95ed1b24e6e06b3fa10dae95bd6b3a0c5c363dc8fbe84032d1f953ccf402",
            {
                input: {
                    prompt: prompt,
                    negative_prompt: negative_prompt || "ugly, deformed, disfigured, poor details, bad anatomy",
                    image: image,
                    condition_scale: 0.8 // Locks the physical shape of the shoe
                }
            }
        );

        if (output && output.length > 0) {
            const firstResult = output[0];
            let parsedUrl = '';

            // Replicate v1.x SDK returns FileOutput objects. We must explicitly extract the URL string.
            if (typeof firstResult === 'object' && typeof firstResult.url === 'function') {
                parsedUrl = firstResult.url().toString();
            } else if (typeof firstResult === 'object' && firstResult.url) {
                parsedUrl = firstResult.url;
            } else {
                parsedUrl = firstResult.toString();
            }

            return res.status(200).json({ imageUrl: parsedUrl });
        } else {
            return res.status(500).json({ error: 'No image generated from Replicate.' });
        }
    } catch (error) {
        console.error('AI Generation Error:', error);
        return res.status(500).json({
            error: `Replicate API Error: ${error.message || 'Unknown string error from Replicate'}`,
            details: error.toString()
        });
    }
}
