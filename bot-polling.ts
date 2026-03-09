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

function getCallKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: `📞 Позвонить ${PHONE_NUMBER}`, url: `tel:${PHONE_LINK}` }
      ]
    ]
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

async function handleMessage(update: any) {
  const message = update.message;
  const callbackQuery = update.callback_query;
  
  // Handle callback queries (button clicks without URLs)
  if (callbackQuery) {
    const chatId = callbackQuery.message?.chat?.id;
    const data = callbackQuery.data;
    
    if (chatId && data) {
      await answerCallbackQuery(callbackQuery.id);
      
      // Send description based on button clicked
      if (sectionDescriptions[data]) {
        await sendMessage(chatId, sectionDescriptions[data], getMainKeyboard());
      } else if (data === "call_me") {
        await sendMessage(
          chatId, 
          `📞 *Заказать звонок*\n\nНажмите кнопку ниже, чтобы отправить свой номер телефона. Мы перезвоним вам в течение 5 минут!\n\n📞 Телефон: ${PHONE_NUMBER}`,
          getCallMeKeyboard()
        );
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
📞 *Позвоните мне* - заказать звонок
📍 *Контакты* - связаться с нами

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
    await sendMessage(chatId, `📞 *Позвоните нам:*\n\n${PHONE_NUMBER}\n\nИли нажмите кнопку ниже для заказа звонка:`, getCallMeKeyboard());
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

Для быстрого доступа к разделу используйте кнопки меню или команды:
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
