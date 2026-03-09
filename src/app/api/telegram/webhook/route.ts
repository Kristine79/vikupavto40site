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
    id: string;
    message?: { chat: { id: number } };
    data?: string;
  };
}

// Text descriptions for each section
const sectionDescriptions: Record<string, string> = {
  services: `🚗 *Услуги автовыкупа*

Мы выкупаем:
• Легковые автомобили (любые марки и модели)
• Битые и аварийные авто
• Авто после ДТП
• Машины с проблемными документами
• Коммерческий транспорт

📍 *Район:* Калуга, Тула, Обнинск и область до 200км

⏱️ *Срок:* Оценка за 15 минут, выкуп за 1 час

💰 *Гарантия:* Честная оценка без скрытых платежей`,

  calculator: `🧮 *Калькулятор оценки авто*

Вы можете рассчитать примерную стоимость вашего автомобиля прямо на сайте.

Для точной оценки:
1. Укажите марку и год выпуска
2. Выберите состояние авто
3. Загрузите фото (опционально)
4. Получите предварительную оценку

📱 Для заказа бесплатной оценки нажмите "Отправить телефон" и наш менеджер свяжется с вами!`,

  advantages: `⭐ *Преимущества АвтоВыкуп40*

✅ Оценка за 15 минут
✅ Выкуп за 1 час
✅ Честные цены без посредников
✅ Бесплатная эвакуация
✅ Работаем 24/7
✅ Документы оформляем сами
✅ Безопасная сделка

💯 Выкупляем авто в любом состоянии!`,

  reviews: `💬 *Отзывы клиентов*

⭐⭐⭐⭐⭐ "Очень быстро оценили и выкупили машину. Деньги получил сразу. Рекомендую!"
— Алексей, Калуга

⭐⭐⭐⭐⭐ "Всё чётко и профессионально. Сделка заняла 40 минут."
— Сергей, Тула

⭐⭐⭐⭐⭐ "Выкупили битый Ауди за хорошую цену. Спасибо!"
— Марина, Обнинск

⭐⭐⭐⭐⭐ "Отличный сервис! Всё сделали быстро и без проблем."
— Дмитрий, Калужская область`,

  contacts: `📍 *Контакты АвтоВыкуп40*

📱 *Telegram:* @AvtoVikup40Bot
📱 *WhatsApp:* ${PHONE_NUMBER}
📞 *Телефон:* ${PHONE_NUMBER}

📍 *Адрес:* Калуга, Тула, Обнинск

⏱️ *Время работы:* Круглосуточно 24/7

💬 Напишите нам в Telegram для быстрой связи!`
};

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    
    const chatId = update.message?.chat?.id;
    const text = update.message?.text;
    const firstName = update.message?.from?.first_name || "друг";
    
    // Handle callback queries (button clicks without URLs)
    const callbackQuery = update.callback_query;
    if (callbackQuery) {
      const callbackChatId = callbackQuery.message?.chat?.id;
      const callbackData = callbackQuery.data;
      
      if (callbackChatId && callbackData) {
        // Answer the callback query to remove loading state
        await fetch(`${BASE_URL}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id
          })
        });
        
        // Send description based on button clicked
        if (sectionDescriptions[callbackData]) {
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: sectionDescriptions[callbackData],
              parse_mode: "Markdown",
              reply_markup: getMainKeyboard()
            })
          });
        } else if (callbackData === "call_me") {
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: `📞 *Заказать звонок*\n\nНажмите кнопку ниже, чтобы отправить свой номер телефона. Мы перезвоним вам в течение 5 минут!\n\n📞 Телефон: ${PHONE_NUMBER}`,
              parse_mode: "Markdown",
              reply_markup: getCallMeKeyboard()
            })
          });
        }
      }
      
      return Response.json({ ok: true });
    }
    
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
📞 *Позвоните мне* - заказать звонок
📍 *Контакты* - связаться с нами

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
      await sendCallMeButton(chatId);
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
      const responseMessage = `Спасибо за сообщение, ${firstName}! 

Для быстрого доступа к разделу используйте кнопки меню или команды:
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

// Main menu keyboard - without URLs, with callback buttons and contact request
function getMainKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🚗 Услуги", callback_data: "services" },
        { text: "🧮 Калькулятор", callback_data: "calculator" }
      ],
      [
        { text: "⭐ Преимущества", callback_data: "advantages" },
        { text: "💬 Отзывы", callback_data: "reviews" }
      ],
      [
        { text: "📱 Отправить телефон", request_contact: true },
        { text: "📞 Позвоните мне", callback_data: "call_me" }
      ],
      [
        { text: "📍 Контакты", callback_data: "contacts" }
      ]
    ]
  };
}

// Call me keyboard - requests contact
function getCallMeKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "📱 Отправить мой телефон", request_contact: true }
      ]
    ]
  };
}

async function sendMainMenu(chatId: number) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📋 *Выберите раздел:*",
      reply_markup: getMainKeyboard(),
      parse_mode: "Markdown"
    })
  });
}

async function sendCallMeButton(chatId: number) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `📞 *Заказать звонок*\n\nНажмите кнопку ниже, чтобы отправить свой номер телефона. Мы перезвоним вам в течение 5 минут!\n\n📞 Телефон: ${PHONE_NUMBER}`,
      reply_markup: getCallMeKeyboard(),
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
