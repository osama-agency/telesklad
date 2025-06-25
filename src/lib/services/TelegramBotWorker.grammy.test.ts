import { Bot, Context, webhookCallback } from 'grammy';

/**
 * Тестовый файл для проверки базовой функциональности grammY
 * перед полной миграцией
 */

export class GrammyTest {
  private bot: Bot;

  constructor(token: string) {
    this.bot = new Bot(token);
    this.setupHandlers();
  }

  private setupHandlers() {
    // Обработка команды /start
    this.bot.command('start', async (ctx) => {
      console.log('✅ grammY: /start command received');
      await ctx.reply('Welcome! grammY is working!');
    });

    // Обработка текстовых сообщений
    this.bot.on('message:text', async (ctx) => {
      console.log(`✅ grammY: Text message: ${ctx.message.text}`);
    });

    // Обработка callback_query
    this.bot.on('callback_query:data', async (ctx) => {
      const data = ctx.callbackQuery.data;
      console.log(`✅ grammY: Callback received: ${data}`);
      
      await ctx.answerCallbackQuery();
      
      if (data === 'test_button') {
        await ctx.editMessageText('Button clicked!');
      }
    });
  }

  // Метод для тестирования отправки сообщения с кнопкой
  async sendTestMessage(chatId: number) {
    await this.bot.api.sendMessage(chatId, 'Test message from grammY', {
      reply_markup: {
        inline_keyboard: [[
          { text: 'Test Button', callback_data: 'test_button' }
        ]]
      }
    });
  }

  // Webhook handler для Express/Next.js
  webhookHandler() {
    return webhookCallback(this.bot, 'express');
  }

  // Получение информации о боте
  async getMe() {
    return await this.bot.api.getMe();
  }

  // Установка webhook
  async setWebhook(url: string, secretToken?: string) {
    await this.bot.api.setWebhook(url, {
      allowed_updates: ['message', 'callback_query'],
      secret_token: secretToken
    });
  }
}

// Функция для быстрого теста
export async function testGrammyBasics() {
  const token = process.env.WEBAPP_TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('❌ No token found for testing');
    return;
  }

  try {
    const test = new GrammyTest(token);
    const botInfo = await test.getMe();
    console.log('✅ grammY initialized successfully!');
    console.log('🤖 Bot info:', botInfo);
    return test;
  } catch (error) {
    console.error('❌ grammY test failed:', error);
    throw error;
  }
}
