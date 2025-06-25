import TelegramBot from 'node-telegram-bot-api';

const SUPPORT_TELEGRAM_BOT_TOKEN = process.env.SUPPORT_TELEGRAM_BOT;

// Указать реальные chat_id ниже
const COURIER_ID = 821810448; // ID курьера
const PURCHASERS_GROUP_ID = -4729817036; // chat_id группы закупщиков
// const ADMIN_ID = ... // если потребуется

if (!SUPPORT_TELEGRAM_BOT_TOKEN) {
  throw new Error('SUPPORT_TELEGRAM_BOT token is not set in environment variables');
}

const supportBot = new TelegramBot(SUPPORT_TELEGRAM_BOT_TOKEN, { polling: false });

export class SupportTelegramBotService {
  static async sendToCourier(message: string) {
    await supportBot.sendMessage(COURIER_ID, message);
  }

  static async sendToPurchasersGroup(message: string) {
    await supportBot.sendMessage(PURCHASERS_GROUP_ID, message);
  }

  // static async sendToAdmin(message: string) {
  //   await supportBot.sendMessage(ADMIN_ID, message);
  // }
} 