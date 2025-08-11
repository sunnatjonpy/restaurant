// netlify/functions/sendOrder.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const { name, phone, address, items } = JSON.parse(event.body);

    // Telegram env variables
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Bot token yoki Chat ID topilmadi!" })
      };
    }

    // Buyurtma matni
    const orderText = `
📦 *Yangi buyurtma keldi!*

👤 Ism: ${name}
📞 Telefon: ${phone}
📍 Manzil: ${address}

🍽 Buyurtma:
${items.map((item, i) => `${i + 1}. ${item.name} x${item.qty} — ${item.price}`).join("\n")}
    `;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    // Telegram API ga yuborish
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: orderText,
        parse_mode: "Markdown"
      })
    });

    const data = await res.json();

    if (!data.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Telegramga yuborishda xatolik", error: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Buyurtma muvaffaqiyatli yuborildi" })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Server xatosi", error: error.message })
    };
  }
};
