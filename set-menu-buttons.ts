/**
 * Script to set Telegram bot menu buttons
 * Run: bun run set-menu-buttons.ts
 */

const BOT_TOKEN = "8522898159:AAEIcLvy1DE8U-R-BTGh3FnFL-CD_6NHsb0";
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Menu buttons matching website sections
const menuButtons = [
  {
    text: "🚗 Услуги",
    url: "https://vikupavto40.ru/#services"
  },
  {
    text: "🧮 Калькулятор",
    url: "https://vikupavto40.ru/#calculator"
  },
  {
    text: "⭐ Преимущества",
    url: "https://vikupavto40.ru/#advantages"
  },
  {
    text: "💬 Отзывы",
    url: "https://vikupavto40.ru/#reviews"
  },
  {
    text: "📞 Контакты",
    url: "https://vikupavto40.ru/#contact"
  }
];

async function setMenuButtons() {
  console.log("Setting Telegram bot menu buttons...\n");

  // First, let's get the current bot info
  const meResponse = await fetch(`${BASE_URL}/getMe`);
  const meData = await meResponse.json();
  
  if (!meData.ok) {
    console.error("Failed to get bot info:", meData);
    return;
  }
  
  console.log(`Bot: @${meData.result.username} (${meData.result.first_name})`);

  // Set each menu button using setChatMenuButton
  // Note: Telegram only supports one default menu button + one web_app button
  // For multiple links, we need to use a different approach
  
  // Option 1: Set a simple menu button (one button only in Telegram)
  // This is the main menu button that appears in the input field area
  const menuButtonParams = {
    text: "📋 Меню",
    web_app: null // Can be used for a web app
  };
  
  // Actually, for links we need to use the menu button configuration
  // Let's use the main button as a link to the main page
  const defaultButtonResponse = await fetch(`${BASE_URL}/setChatMenuButton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      menu_button: {
        type: "web_app",
        text: "🌐 АвтоВыкуп40",
        web_app: { url: "https://vikupavto40.ru" }
      }
    })
  });
  
  const defaultButtonData = await defaultButtonResponse.json();
  console.log("\nSet default menu button:", defaultButtonData.ok ? "✅ Success" : "❌ Failed", defaultButtonData);
  
  // Note: Telegram only allows ONE menu button (not multiple like other apps)
  // The button can be either a web_app or default (commands list)
  // To have multiple "menu items", we typically use /commands or inline keyboards
  
  console.log("\n⚠️  Telegram limitation: Only one menu button is supported.");
  console.log("Alternative approaches:");
  console.log("1. Use /start command with inline keyboard menu");
  console.log("2. Use bot commands (/menu, /services, etc.)");
  console.log("3. Use inline keyboard when user first messages the bot");
  
  // Let's create a more complete solution with commands
  console.log("\n📝 Setting bot commands...");
  
  const commandsResponse = await fetch(`${BASE_URL}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commands: [
        { command: "start", description: "🚀 Главная" },
        { command: "services", description: "🚗 Услуги" },
        { command: "calculator", description: "🧮 Калькулятор" },
        { command: "advantages", description: "⭐ Преимущества" },
        { command: "reviews", description: "💬 Отзывы" },
        { command: "contacts", description: "📞 Контакты" }
      ]
    })
  });
  
  const commandsData = await commandsResponse.json();
  console.log("Set commands:", commandsData.ok ? "✅ Success" : "❌ Failed", commandsData);
  
  console.log("\n✅ Bot configured!");
  console.log("\n📋 Bot now has:");
  console.log("   - Menu button: 🌐 АвтоВыкуп40 (opens website)");
  console.log("   - Commands: /start, /services, /calculator, /advantages, /reviews, /contacts");
  console.log("\n🌐 Open @AvtoVikup40_bot to see the menu!");
}

setMenuButtons().catch(console.error);
