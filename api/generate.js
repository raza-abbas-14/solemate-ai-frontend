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

        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        const inputParams = {
            prompt: prompt,
            negative_prompt: negative_prompt || "ugly, deformed, disfigured, poor details, bad anatomy",
            width: 768,
            height: 768,
            refine: "expert_ensemble_refiner",
            num_outputs: 1,
            apply_watermark: false
        };

        // If an init image is provided for Img2Img mapping
        if (image) {
            inputParams.image = image;
            inputParams.prompt_strength = 0.7;
        }

        const output = await replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            { input: inputParams }
        );

        if (output && output.length > 0) {
            return res.status(200).json({ imageUrl: output[0] });
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
