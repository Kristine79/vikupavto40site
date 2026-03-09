/**
 * Telegram Bot - Long Polling Version
 * Works without webhooks - uses getUpdates API method
 * Run with: bun run bot-polling.ts
 */

const BOT_TOKEN = "8522898159:AAEIcLvy1DE8U-R-BTGh3FnFL-CD_6NHsb0";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const PHONE_NUMBER = "79105954668";
const PHONE_LINK = "+79105954668";

// Track last update to avoid duplicates
let lastUpdateId = 0;

// Simple in-memory user state (for demonstration)
const userStates = new Map<number, string>();

async function getUpdates() {
  try {
    const response = await fetch(`${BASE_URL}/getUpdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offset: lastUpdateId + 1,
        timeout: 30 // Long polling - wait up to 30 seconds
      })
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error("Error getting updates:", data);
      return;
    }
    
    return data.result || [];
  } catch (error) {
    console.error("Request error:", error);
    return [];
  }
}

async function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  try {
    await fetch(`${BASE_URL}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        ...(replyMarkup && { reply_markup: replyMarkup })
      })
    });
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  try {
    await fetch(`${BASE_URL}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text
      })
    });
  } catch (error) {
    console.error("Error answering callback:", error);
  }
}

function getMainKeyboard() {
  return {
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
}

function getCallKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `📞 Позвонить нам ${PHONE_NUMBER}`, url: `tel:${PHONE_LINK}` }
      ],
      [
        { text: "📱 Заказать звонок", url: "https://t.me/AvtoVikup40_bot?text=Перезвоните+мне" }
      ]
    ]
  };
}

async function handleMessage(update: any) {
  const message = update.message;
  const callbackQuery = update.callback_query;
  
  // Handle callback queries
  if (callbackQuery) {
    const chatId = callbackQuery.message?.chat?.id;
    const data = callbackQuery.data;
    
    if (chatId && data) {
      await answerCallbackQuery(callbackQuery.id);
      
      // Handle callback data
      if (data === "call") {
        await sendMessage(chatId, `📞 *Позвоните нам:*\n\n${PHONE_NUMBER}`, getCallKeyboard());
      } else if (data === "contact") {
        await sendMessage(chatId, "📱 Нажмите кнопку ниже, чтобы отправить свой номер телефона:", getMainKeyboard());
      }
    }
    return;
  }
  
  // Handle regular messages
  if (!message) return;
  
  const chatId = message.chat.id;
  const text = message.text;
  const firstName = message.from?.first_name || "друг";
  const phoneNumber = message.contact?.phone_number;
  
  // Handle contact sharing
  if (phoneNumber) {
    await sendMessage(chatId, `Спасибо! Мы получили ваш номер телефона: ${phoneNumber}\n\nНаш менеджер перезвонит вам в течение 5 минут! 📞`);
    console.log(`📱 New phone collected: ${phoneNumber} from user ${firstName} (${chatId})`);
    return;
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

    await sendMessage(chatId, welcomeMessage);
    await sendMessage(chatId, "📋 *Выберите раздел:*", getMainKeyboard());
    return;
  }
  
  // Handle /menu command
  if (text === "/menu" || text === "/services" || text === "/calculator" || 
      text === "/advantages" || text === "/reviews" || text === "/contacts") {
    await sendMessage(chatId, "📋 *Выберите раздел:*", getMainKeyboard());
    return;
  }
  
  // Handle /help command
  if (text === "/help") {
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

    await sendMessage(chatId, helpMessage);
    return;
  }
  
  // Handle /call command
  if (text === "/call") {
    await sendMessage(chatId, `📞 *Позвоните нам:*\n\n${PHONE_NUMBER}\n\nИли оставьте заявку на обратный звонок!`, getCallKeyboard());
    return;
  }
  
  // Handle phone number messages (Russian format)
  if (text && /^(\+7|8)[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/.test(text.trim())) {
    const phone = text.trim();
    await sendMessage(chatId, `Спасибо! Мы получили ваш номер телефона: ${phone}\n\nНаш менеджер перезвонит вам в течение 5 минут! 📞`);
    console.log(`📱 Phone submitted via text: ${phone} from user ${firstName} (${chatId})`);
    return;
  }
  
  // Handle other text messages
  if (text) {
    const responseMessage = `Спасибо за сообщение, ${firstName}! 

Для быстрого доступа к разделу используйте кнопки ниже или команды:
/menu - Показать меню
/services - Услуги
/contacts - Контакты`;

    await sendMessage(chatId, responseMessage);
    await sendMessage(chatId, "📋 *Выберите раздел:*", getMainKeyboard());
    return;
  }
}

async function poll() {
  console.log("🤖 Bot polling started... (Press Ctrl+C to stop)");
  console.log(`Bot: @${(await fetch(`${BASE_URL}/getMe`).then(r => r.json())).result.username}`);
  
  while (true) {
    try {
      const updates = await getUpdates();
      
      for (const update of updates || []) {
        await handleMessage(update);
        lastUpdateId = update.update_id;
      }
    } catch (error) {
      console.error("Poll error:", error);
      await new Promise(r => setTimeout(r, 5000)); // Wait 5 seconds on error
    }
  }
}

// Start polling
poll();
