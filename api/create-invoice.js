export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { price, currency, description } = req.body;

    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
        console.error('NOWPAYMENTS_API_KEY not set');
        return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
    }

    const payload = {
        price_amount: price,
        price_currency: currency,
        order_description: description,
        order_id: 'order_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        ipn_callback_url: '',
        success_url: '',
        cancel_url: ''
    };

    try {
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.invoice_url) {
            return res.status(200).json({ invoice_url: data.invoice_url });
        } else {
            console.error('NOWPayments API error:', data);
            return res.status(500).json({ error: 'NOWPayments API error', details: data });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}