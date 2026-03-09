/**
 * Telegram Bot Webhook Handler
 * Handles incoming messages from Telegram
 */

const BOT_TOKEN = "8522898159:AAEIcLvy1DE8U-R-BTGh3FnFL-CD_6NHsb0";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { first_name?: string };
    text?: string;
  };
  callback_query?: {
    message?: { chat: { id: number } };
    data?: string;
  };
}

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    
    const chatId = update.message?.chat?.id;
    const text = update.message?.text;
    const firstName = update.message?.from?.first_name || "друг";
    
    if (!chatId) {
      return Response.json({ ok: true });
    }
    
    // Handle /start command
    if (text === "/start") {
      const welcomeMessage = `Привет, ${firstName}! 🚗

Я бот АвтоВыкуп40 - сервис выкупа автомобилей в Калуге, Туле и Обнинске.

Выберите раздел:
🚗 *Услуги* - что мы выкупаем
🧮 *Калькулятор* - рассчитать стоимость авто
⭐ *Преимущества* - почему выбирают нас
💬 *Отзывы* - отзывы клиентов
📞 *Контакты* - связаться с нами

Или нажмите /menu для показа кнопок меню`;

      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeMessage,
          parse_mode: "Markdown"
        })
      });
      
      // Also send the main menu keyboard
      await sendMainMenu(chatId);
    }
    
    // Handle /menu command
    else if (text === "/menu" || text === "/services" || text === "/calculator" || 
             text === "/advantages" || text === "/reviews" || text === "/contacts") {
      await sendMainMenu(chatId);
    }
    
    // Handle /help command
    else if (text === "/help") {
      const helpMessage = `📋 *Доступные команды:*

/start - Главное меню
/menu - Показать кнопки
/services - Наши услуги
/calculator - Калькулятор
/advantages - Преимущества
/reviews - Отзывы
/contacts - Контакты
/help - Помощь

Или просто напишите свой вопрос!`;

      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: helpMessage,
          parse_mode: "Markdown"
        })
      });
    }
    
    // Handle text messages - respond with main menu
    else if (text) {
      const responseMessage = `Спасибо за сообщение, ${firstName}}! 

Для быстрого доступа к разделу используйте кнопки ниже или команды:
/menu - Показать меню
/services - Услуги
/contacts - Контакты`;

      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseMessage,
          parse_mode: "Markdown"
        })
      });
      
      await sendMainMenu(chatId);
    }
    
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

async function sendMainMenu(chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "🚗 Услуги", url: "https://vikupavto40.ru/#services" },
        { text: "🧮 Калькулятор", url: "https://vikupavto40.ru/#calculator" }
      ],
      [
        { text: "⭐ Преимущества", url: "https://vikupavto40.ru/#advantages" },
        { text: "💬 Отзывы", url: "https://vikupavto40.ru/#reviews" }
      ],
      [
        { text: "📞 Контакты", url: "https://vikupavto40.ru/#contact" }
      ]
    ]
  };

  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📋 *Выберите раздел:*",
      reply_markup: keyboard,
      parse_mode: "Markdown"
    })
  });
}

// Add GET for webhook verification
export async function GET() {
  return Response.json({ 
    status: "Bot is running!",
    webhook: "Set up at /api/telegram/webhook",
    commands: ["/start", "/menu", "/services", "/calculator", "/advantages", "/reviews", "/contacts", "/help"]
  });
}
