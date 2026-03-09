/**
 * Telegram Bot Webhook Handler
 * Handles incoming messages from Telegram
 */

const BOT_TOKEN = "8522898159:AAEIcLvy1DE8U-R-BTGh3FnFL-CD_6NHsb0";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const PHONE_NUMBER = "79105954668";
const PHONE_LINK = "+79105954668";

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { first_name?: string; phone_number?: string };
    text?: string;
    contact?: { phone_number: string };
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

📱 *Отправить телефон* - чтобы мы перезвонили

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
/call - Позвонить нам
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
    
    // Handle /call command
    else if (text === "/call") {
      await sendCallButton(chatId);
    }
    
    // Handle phone number messages (Russian format: +7 xxx xxx-xx-xx or 8 xxx xxx-xx-xx)
    else if (text && /^(\+7|8)[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(text.trim())) {
      const phone = text.trim();
      // Forward phone to admin
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Спасибо! Мы получили ваш номер телефона: ${phone}

Наш менеджер перезвонит вам в течение 5 минут! 📞`,
          parse_mode: "Markdown"
        })
      });
      
      // Also notify admin (same chat for now - in production would be separate admin chat)
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📱 *Новый запрос на звонок!*\n\nОт: ${firstName}\nТелефон: ${phone}\n\nID чата: ${chatId}`,
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
        { text: "📱 Отправить телефон", request_contact: true },
        { text: "📞 Позвонить нам", url: `tel:${PHONE_LINK}` }
      ],
      [
        { text: "📍 Контакты", url: "https://vikupavto40.ru/#contact" }
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

async function sendCallButton(chatId: number) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "📞 Позвонить нам ${PHONE_NUMBER}", url: `tel:${PHONE_LINK}` }
      ],
      [
        { text: "📱 Заказать звонок", url: "https://t.me/AvtoVikup40_bot?text=Перезвоните+мне" }
      ]
    ]
  };

  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📞 *Позвоните нам:*\n\n${PHONE_NUMBER}\n\nИли оставьте заявку на обратный звонок!`,
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
