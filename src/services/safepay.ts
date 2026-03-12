// SoleMate AI - Safepay API Helper
// Handles checkout session generation for advance and full payments

const SAFEPAY_API_URL = 'https://sandbox.api.getsafepay.com'; // Use sandbox for now

export interface CheckoutOptions {
    amount: number;
    orderId: string;
    source: 'custom';
}

export async function createCheckoutSession(options: CheckoutOptions): Promise<string> {
    const publicKey = import.meta.env.VITE_SAFEPAY_PUBLIC_KEY;
    if (!publicKey) {
        console.warn('Safepay Public Key missing in .env.local');
        throw new Error('Safepay Public Key missing from environment configuration.');
    }

    try {
        // 1. Initialize tracker via Vercel Secure Serverless Backend
        // The backend securely stores the VITE_SAFEPAY_SECRET_KEY and handles the initialization
        const response = await fetch(`/api/safepay/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client: publicKey,
                amount: Number(options.amount.toFixed(2)),
                currency: 'PKR',
                environment: 'sandbox'
            })
        });

        if (!response.ok) {
            throw new Error(`Safepay initialization failed: ${response.statusText}`);
        }

        const data = await response.json();

        // 2. Construct checkout URL with the received tracker
        const checkoutUrl = new URL(`${SAFEPAY_API_URL}/checkout/pay`);
        checkoutUrl.searchParams.append('env', 'sandbox');
        checkoutUrl.searchParams.append('beacon', data.data.token);
        checkoutUrl.searchParams.append('source', 'custom');
        checkoutUrl.searchParams.append('order_id', options.orderId);
        
        // Add redirect and cancel URLs so Safepay returns back to the website
        const origin = window.location.origin;
        checkoutUrl.searchParams.append('redirect_url', `${origin}/?payment=success&order=${options.orderId}`);
        checkoutUrl.searchParams.append('cancel_url', `${origin}/?payment=cancel`);

        // Callbacks can be managed in your app via standard redirect handling
        return checkoutUrl.toString();

    } catch (error) {
        console.error('Error creating Safepay session:', error);
        throw error;
    }
}
