// src/services/telegram.service.ts
import TelegramBot from 'node-telegram-bot-api'
import fs from 'fs'
import path from 'path'

export class TelegramService {
  private bot: TelegramBot
  private channelId: string

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string)
    this.channelId = process.env.TELEGRAM_CHANNEL_ID as string
  }

  async sendVideo(videoPath: string, caption: string) {
    try {
      const fileStream = fs.createReadStream(videoPath)
      await this.bot.sendVideo(this.channelId, fileStream, {
        caption,
        contentType: 'video/mp4',
        width: 720,
        height: 1280
      })

      console.log('📤 Видео отправлено в Telegram')

      fs.unlinkSync(videoPath)
      console.log('🗑️ Файл удалён:', videoPath)
    } catch (err) {
      console.error('❌ Ошибка отправки в Telegram:', err)
    }
  }
}
