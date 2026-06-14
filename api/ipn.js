export default async function handler(req, res) {
    // Только POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Получаем данные о платеже
    const payment = req.body;

    // Логируем всё (в Vercel → Functions → api/ipn.js → Logs)
    console.log('=== IPN received ===');
    console.log('Status:', payment.payment_status);
    console.log('Order ID:', payment.order_id);
    console.log('Payment ID:', payment.payment_id);
    console.log('Amount:', payment.pay_amount, payment.pay_currency);
    console.log('Full data:', JSON.stringify(payment, null, 2));

    // Проверяем статус
    if (payment.payment_status === 'finished') {
        console.log('✅ Платёж успешен! Order ID:', payment.order_id);
        // СЮДА МОЖНО ДОБАВИТЬ СВОЮ ЛОГИКУ:
        // - обновить базу данных
        // - отправить email клиенту
        // - вызвать другой API
    } else if (payment.payment_status === 'failed') {
        console.error('❌ Платёж не удался:', payment.order_id);
    } else if (payment.payment_status === 'expired') {
        console.warn('⚠️ Счёт просрочен:', payment.order_id);
    }

    // Всегда отвечаем 200, иначе NOWPayments будет повторять запросы
    return res.status(200).json({ received: true });
}