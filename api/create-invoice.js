// api/create-invoice.js
export default async function handler(req, res) {
    // Разрешаем только POST-запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Получаем данные о платеже от клиента
    const { amount, currency, description } = req.body;

    // Забираем API-ключ из переменных окружения (Settings -> Environment Variables)
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    // Проверяем, что ключ задан
    if (!apiKey) {
        console.error('NOWPAYMENTS_API_KEY not set');
        return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
    }

    // Формируем данные для запроса к NOWPayments
    const payload = {
        price_amount: amount,
        price_currency: currency,
        pay_currency: currency, // здесь можно указать конкретную криптовалюту, если нужно
        order_id: 'order_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        order_description: description,
        ipn_callback_url: '', // URL для получения уведомлений о статусе платежа
        success_url: '', // URL для перенаправления после успешной оплаты
        cancel_url: ''   // URL для перенаправления при отмене оплаты
    };

    try {
        // Отправляем запрос на создание инвойса в NOWPayments
        const response = await fetch('https://api.nowpayments.io/v1/invoice', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        // Если всё прошло успешно, возвращаем клиенту ссылку на оплату
        if (data.invoice_url) {
            return res.status(200).json({ invoice_url: data.invoice_url });
        } else {
            // Если NOWPayments вернул ошибку, логируем её и отправляем клиенту
            console.error('NOWPayments API error:', data);
            return res.status(500).json({ error: 'NOWPayments API error', details: data });
        }
    } catch (error) {
        // Обрабатываем ошибки сети или другие внутренние ошибки сервера
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}