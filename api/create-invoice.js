export default async function handler(req, res) {
    // Только POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Данные от фронтенда (как у тебя сейчас)
    const { price, currency, description } = req.body;

    // API-ключ из переменных окружения Vercel
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
        console.error('NOWPAYMENTS_API_KEY not set');
        return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
    }

    // Формируем запрос к NOWPayments
    const payload = {
        price_amount: price,
        price_currency: currency,
        is_fiat_on_ramp: true,              // ВКЛЮЧАЕТ ОПЛАТУ КАРТОЙ (евро)
        order_description: description,
        order_id: 'order_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        ipn_callback_url: 'https://hm-ct.vercel.app/api/ipn',   // ЗДЕСЬ ТВОЙ ДОМЕН
        success_url: 'https://hm-ct.vercel.app/success',        // ЗДЕСЬ ТВОЙ ДОМЕН
        cancel_url: 'https://hm-ct.vercel.app/cancel'          // ЗДЕСЬ ТВОЙ ДОМЕН
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

        if (response.ok && data.invoice_url) {
            // Успех: возвращаем ссылку на оплату
            return res.status(200).json({ invoice_url: data.invoice_url });
        } else {
            // Ошибка от NOWPayments
            console.error('NOWPayments API error:', data);
            return res.status(500).json({ 
                error: 'NOWPayments API error', 
                details: data 
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}