/**
 * Telegram Bot Webhook Handler - Дмитрий Оценщик
 * Conversational bot for car buyout estimation
 * Follows the scenario: photo request -> qualification -> price offer -> close deal
 */

const BOT_TOKEN = "8522898159:AAEIcLvy1DE8U-R-BTGh3FnFL-CD_6NHsb0";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const PHONE_NUMBER = "79105954668";
const ADMIN_CHAT_ID = 1194984806; // Admin chat ID for notifications

// User state machine
type UserState = 
  | 'start'
  | 'waiting_photos_brand'
  | 'waiting_year'
  | 'waiting_accidents'
  | 'waiting_price'
  | 'processing'
  | 'waiting_location_phone'
  | 'finished';

interface UserSession {
  state: UserState;
  brand?: string;
  year?: string;
  accidents?: string;
  desiredPrice?: string;
  photos: string[]; // Photo file IDs
  name?: string;
}

// In-memory session storage (in production, use Redis or database)
const userSessions: Map<number, UserSession> = new Map();

// Year options for buttons
const yearButtons = [
  ["2010 и ранее", "2011", "2012", "2013"],
  ["2014", "2015", "2016", "2017"],
  ["2018", "2019", "2020", "2021"],
  ["2022", "2023", "2024", "2025"]
];

// Price options for buttons
const priceButtons = [
  ["до 300 000 ₽", "300 000 - 400 000 ₽", "400 000 - 500 000 ₽"],
  ["500 000 - 700 000 ₽", "700 000 - 1 000 000 ₽", "1 000 000 - 1 500 000 ₽"],
  ["1 500 000 - 2 000 000 ₽", "свыше 2 000 000 ₽"]
];

// Yes/No buttons
const yesNoKeyboard = {
  inline_keyboard: [
    [{ text: "✅ Да", callback_data: "ans_yes" }, { text: "❌ Нет", callback_data: "ans_no" }]
  ]
};

// Location/Phone request keyboard
const locationPhoneKeyboard = {
  keyboard: [
    [{ text: "📍 Отправить геолокацию", request_location: true }],
    [{ text: "📱 Отправить телефон", request_contact: true }],
    ["❌ Отмена"]
  ],
  resize_keyboard: true,
  one_time_keyboard: true
};

interface TelegramUpdate {
  message?: {
    chat: { id: number };
    from?: { first_name?: string; id?: number };
    text?: string;
    photo?: Array<{ file_id: string }>;
    contact?: { phone_number: string };
    location?: { latitude: number; longitude: number };
  };
  callback_query?: {
    id: string;
    message?: { chat: { id: number }; message_id: number };
    data?: string;
  };
}

// Keyboard builders
function getYearKeyboard() {
  return {
    inline_keyboard: yearButtons.map(row => row.map(year => ({ text: year, callback_data: `year_${year}` })))
  };
}

function getPriceKeyboard() {
  return {
    inline_keyboard: priceButtons.map(row => row.map(price => ({ text: price, callback_data: `price_${price}` })))
  };
}

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();
    
    const chatId = update.message?.chat?.id;
    const userId = update.message?.from?.id;
    const text = update.message?.text;
    const firstName = update.message?.from?.first_name || "друг";
    const photos = update.message?.photo;
    
    // Handle callback queries (button clicks)
    const callbackQuery = update.callback_query;
    if (callbackQuery) {
      const callbackChatId = callbackQuery.message?.chat?.id;
      const callbackData = callbackQuery.data;
      
      if (callbackChatId && callbackData) {
        // Answer callback to stop loading
        await fetch(`${BASE_URL}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ callback_query_id: callbackQuery.id })
        });
        
        const session = userSessions.get(callbackChatId);
        
        // Handle year selection
        if (callbackData.startsWith('year_') && session) {
          const year = callbackData.replace('year_', '');
          session.year = year;
          session.state = 'waiting_accidents';
          
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: `Понял, ${year} года выпуска. А теперь последний вопрос:`,
              parse_mode: "Markdown"
            })
          });
          
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: "🚨 *Были ли серьёзные ДТП?*\n\n(Аварии с повреждением кузова, двигателя или несущих элементов)",
              parse_mode: "Markdown",
              reply_markup: yesNoKeyboard
            })
          });
        }
        
        // Handle price selection
        else if (callbackData.startsWith('price_') && session) {
          const price = callbackData.replace('price_', '');
          session.desiredPrice = price;
          session.state = 'processing';
          
          // Calculate offer (in production, this would use real data)
          const basePrice = parsePrice(price);
          const offerMin = Math.round(basePrice * 0.85);
          const offerMax = Math.round(basePrice * 0.95);
          
          // Send processing message
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: "⏳ *Отлично! Сейчас вычислю стоимость...*\n\nЭто займёт всего пару минут.",
              parse_mode: "Markdown"
            })
          });
          
          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Send price offer
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: `💰 *Готов сделать вам предложение!*\n\nЯ готов предложить вам сумму *от ${offerMin.toLocaleString()} до ${offerMax.toLocaleString()} рублей* в зависимости от состояния автомобиля.\n\nКак вам такая цена?`,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "✅ Устраивает", callback_data: "offer_accept" }, { text: "❌ Не устраивает", callback_data: "offer_reject" }]
                ]
              }
            })
          });
        }
        
        // Handle offer acceptance
        else if (callbackData === 'offer_accept' && session) {
          session.state = 'waiting_location_phone';
          
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: `✅ *Отлично!*\n\nЯ готов выехать к вам в любой район Калуги или области.\n\nПожалуйста, скиньте свою геолокацию и номер телефона для связи:`,
              parse_mode: "Markdown",
              reply_markup: locationPhoneKeyboard
            })
          });
          
          // Notify admin
          await notifyAdmin(session, callbackChatId);
        }
        
        // Handle offer rejection
        else if (callbackData === 'offer_reject' && session) {
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: "😔 *Понимаю, что цена может не устроить.*\n\nЕсли хотите, я могу пересчитать с учётом дополнительных факторов. Или вы можете оставить заявку на будущее!",
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔄 Пересчитать", callback_data: "recalculate" }, { text: "📝 Оставить заявку", callback_data: "leave_request" }]
                ]
              }
            })
          });
        }
        
        // Handle recalculate
        else if (callbackData === 'recalculate' && session) {
          session.state = 'waiting_price';
          
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: "📊 *Давайте пересчитаем*\n\nКакую сумму вы хотите получить за автомобиль?",
              parse_mode: "Markdown",
              reply_markup: getPriceKeyboard()
            })
          });
        }
        
        // Handle leave request
        else if (callbackData === 'leave_request' && session) {
          session.state = 'finished';
          
          // Save to waiting list notification to admin
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: ADMIN_CHAT_ID,
              text: `📝 *Новая заявка на будущее!*\n\nМарка: ${session.brand || 'не указана'}\nГод: ${session.year || 'не указан'}\nДТП: ${session.accidents || 'не указано'}\nЖелаемая цена: ${session.desiredPrice || 'не указана'}\n\nID клиента: ${callbackChatId}`,
              parse_mode: "Markdown"
            })
          });
          
          await fetch(`${BASE_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: callbackChatId,
              text: "✅ *Ваша заявка сохранена!*\n\nСпасибо за обращение! Если у вас возникнут вопросы или вы захотите продать автомобиль позже, просто напишите мне.",
              parse_mode: "Markdown"
            })
          });
        }
        
        // Handle start/reset
        else if (callbackData === 'start_over') {
          userSessions.delete(callbackChatId);
          await sendWelcome(callbackChatId, firstName);
        }
        
        return Response.json({ ok: true });
      }
    }
    
    if (!chatId) {
      return Response.json({ ok: true });
    }
    
    // Get or create session
    let session = userSessions.get(chatId);
    
    // Handle /start command - reset and start fresh
    if (text === "/start") {
      userSessions.delete(chatId);
      await sendWelcome(chatId, firstName);
      return Response.json({ ok: true });
    }
    
    // Handle /menu command
    if (text === "/menu") {
      await sendMainMenu(chatId);
      return Response.json({ ok: true });
    }
    
    // Handle /help command
    if (text === "/help") {
      const helpText = `📋 *Помощь*\n\n/start - Начать оценку автомобиля\n/menu - Показать меню\n/reset - Начать заново\n\nПросто отправьте мне 3 фото вашего авто и его марку!`;
      
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: helpText,
          parse_mode: "Markdown"
        })
      });
      return Response.json({ ok: true });
    }
    
    // Handle /reset command
    if (text === "/reset") {
      userSessions.delete(chatId);
      await sendWelcome(chatId, firstName);
      return Response.json({ ok: true });
    }
    
    // Handle photo messages
    if (photos && photos.length > 0) {
      if (!session) {
        session = { state: 'waiting_photos_brand', photos: [] };
        userSessions.set(chatId, session);
      }
      
      // Collect photo file IDs
      const photoIds = photos.map(p => p.file_id);
      session.photos = [...session.photos, ...photoIds].slice(0, 3);
      
      if (session.state === 'waiting_photos_brand') {
        // Just received first photos, ask for brand
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📸 *Спасибо! Я принял ваши фото (${session.photos.length}/3)*\n\nТеперь укажите, пожалуйста, *марку* вашего автомобиля (например: Toyota, BMW, Lada)`,
            parse_mode: "Markdown"
          })
        });
        
        session.state = 'waiting_year';
      }
      
      return Response.json({ ok: true });
    }
    
    // Handle text messages based on current state
    if (text && session) {
      // Handle brand input (when waiting for year)
      if (session.state === 'waiting_year' && !text.startsWith('/')) {
        session.brand = text;
        session.state = 'waiting_accidents';
        
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ *Отлично! ${text}*\n\nТеперь скажите, пожалуйста:`,
            parse_mode: "Markdown"
          })
        });
        
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "📅 *Какой год выпуска вашего автомобиля?*",
            parse_mode: "Markdown",
            reply_markup: getYearKeyboard()
          })
        });
        
        return Response.json({ ok: true });
      }
      
      // Handle accidents answer (when waiting for price)
      if (session.state === 'waiting_accidents' && !text.startsWith('/')) {
        const isYes = text.toLowerCase().includes('да') || text.toLowerCase().includes('yes') || text === "✅ Да";
        session.accidents = isYes ? 'Да' : 'Нет';
        
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ *Понял${isYes ? ', были ДТП' : ', без серьёзных ДТП'}*\n\nИ последний вопрос:`,
            parse_mode: "Markdown"
          })
        });
        
        session.state = 'waiting_price';
        
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "💰 *Какую сумму вы хотите получить за автомобиль?*",
            parse_mode: "Markdown",
            reply_markup: getPriceKeyboard()
          })
        });
        
        return Response.json({ ok: true });
      }
      
      // Handle location
      if (session.state === 'waiting_location_phone' && text === "📍 Отправить геолокацию") {
        // User clicked location button - they need to actually share location
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "📍 Нажмите кнопку ниже для отправки геолокации",
            reply_markup: { keyboard: [[{ text: "📍 Отправить геолокацию", request_location: true }], ["❌ Отмена"]], resize_keyboard: true }
          })
        });
        return Response.json({ ok: true });
      }
      
      // Handle contact
      if (session.state === 'waiting_location_phone' && text === "📱 Отправить телефон") {
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "📱 Нажмите кнопку ниже для отправки телефона",
            reply_markup: { keyboard: [[{ text: "📱 Отправить телефон", request_contact: true }], ["❌ Отмена"]], resize_keyboard: true }
          })
        });
        return Response.json({ ok: true });
      }
      
      // Handle cancel
      if (text === "❌ Отмена") {
        session.state = 'finished';
        
        await fetch(`${BASE_URL}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "❌ *Отменено*\n\nСпасибо за обращение! Если передумаете, просто напишите /start",
            parse_mode: "Markdown"
          })
        });
        return Response.json({ ok: true });
      }
    }
    
    // Handle location message
    if (update.message?.location && session) {
      const lat = update.message.location.latitude;
      const lon = update.message.location.longitude;
      
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `📍 *Геолокация получена!*\n\nШирота: ${lat}\nДолгота: ${lon}\n\nТеперь отправьте номер телефона:`,
          parse_mode: "Markdown",
          reply_markup: { keyboard: [[{ text: "📱 Отправить телефон", request_contact: true }], ["❌ Отмена"]], resize_keyboard: true }
        })
      });
      return Response.json({ ok: true });
    }
    
    // Handle contact message
    if (update.message?.contact && session) {
      const phone = update.message.contact.phone_number;
      
      // Notify admin about complete lead
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: `🎉 *НОВЫЙ КЛИЕНТ!*\n\nМарка: ${session.brand || 'не указана'}\nГод: ${session.year || 'не указан'}\nДТП: ${session.accidents || 'не указано'}\nЖелаемая цена: ${session.desiredPrice || 'не указана'}\nТелефон: ${phone}\nID клиента: ${chatId}\n\nФото: ${session.photos.length} шт.`,
          parse_mode: "Markdown"
        })
      });
      
      session.state = 'finished';
      userSessions.delete(chatId);
      
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `✅ *Спасибо! Заявка оформлена!*\n\nМы свяжемся с вами в течение 15 минут!\n\n📞 Телефон: ${phone}\n📍 Локация сохранена\n\nДо скорой встречи! 👋`,
          parse_mode: "Markdown"
        })
      });
      
      return Response.json({ ok: true });
    }
    
    // Default response - start the conversation
    if (!session || session.state === 'finished') {
      await sendWelcome(chatId, firstName);
    } else {
      // In progress - remind of current step
      await fetch(`${BASE_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Пожалуйста, ответьте на текущий вопрос или нажмите /start для начала заново",
          parse_mode: "Markdown"
        })
      });
    }
    
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

async function sendWelcome(chatId: number, firstName: string) {
  const welcomeMessage = `Привет, ${firstName}! 👋

Я *Дмитрий*, старший оценщик в компании «Выкупавто40».

Здесь вы можете узнать реальную стоимость вашего автомобиля без звонков и спама. 

Просто отправьте мне *3 фото* вашего авто и его *марку*!`;

  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: welcomeMessage,
      parse_mode: "Markdown"
    })
  });
  
  // Start session
  userSessions.set(chatId, { state: 'waiting_photos_brand', photos: [] });
}

async function sendMainMenu(chatId: number) {
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "📋 *Меню*\n\n/start - Начать оценку автомобиля\n/reset - Начать заново\n/help - Помощь",
      parse_mode: "Markdown"
    })
  });
}

async function notifyAdmin(session: UserSession, chatId: number) {
  const message = `🎯 *Новая заявка на выкуп!*\n\n🚗 *Автомобиль:* ${session.brand || 'не указана'}\n📅 *Год:* ${session.year || 'не указан'}\n💥 *ДТП:* ${session.accidents || 'не указано'}\n💰 *Желаемая цена:* ${session.desiredPrice || 'не указана'}\n📸 *Фото получено:* ${session.photos.length} шт.\n\n🆔 *ID клиента:* ${chatId}`;
  
  await fetch(`${BASE_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: "Markdown"
    })
  });
}

function parsePrice(priceStr: string): number {
  // Parse price string to number (in thousands)
  if (priceStr.includes('до 300')) return 250000;
  if (priceStr.includes('300 000 - 400 000')) return 350000;
  if (priceStr.includes('400 000 - 500 000')) return 450000;
  if (priceStr.includes('500 000 - 700 000')) return 600000;
  if (priceStr.includes('700 000 - 1 000 000')) return 850000;
  if (priceStr.includes('1 000 000 - 1 500 000')) return 1250000;
  if (priceStr.includes('1 500 000 - 2 000 000')) return 1750000;
  if (priceStr.includes('свыше 2 000 000')) return 2500000;
  return 500000; // default
}

// GET handler for webhook verification
export async function GET() {
  return Response.json({ 
    status: "Bot is running!",
    webhook: "Set up at /api/telegram/webhook",
    version: "2.0 - Дмитрий Оценщик",
    commands: ["/start", "/menu", "/help", "/reset"]
  });
}
