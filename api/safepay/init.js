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

    try {
        const { client, amount, currency, environment } = req.body;

        const secretKey = process.env.SAFEPAY_SECRET_KEY;
        if (!secretKey) return res.status(500).json({ error: 'Safepay Secret Key missing on Vercel Server.' });

        const safepayUrl = environment === 'sandbox'
            ? 'https://sandbox.api.getsafepay.com/order/v1/init'
            : 'https://api.getsafepay.com/order/v1/init';

        const response = await fetch(safepayUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-SFPY-MERCHANT-SECRET': secretKey
            },
            body: JSON.stringify({
                client,
                amount,
                currency: currency || 'PKR',
                environment: environment || 'sandbox'
            })
        });

        const data = await response.json();
        if (!response.ok) return res.status(response.status).json(data);

        return res.status(200).json(data);
    } catch (error) {
        console.error('Safepay init error:', error);
        return res.status(500).json({ error: 'Failed to initialize Safepay session.' });
    }
}
