import express from 'express'
import cors from 'cors'
import globalRouter from './routes/global-router'
import cron from 'node-cron'
import './db'
import axios from 'axios'
import { TelegramService } from './telegram'
import fs from 'fs'

const app = express()

const API_BASE_URL = process.env.API_BASE_URL
const API_BASE_PORT = process.env.PORT

const telegramService = new TelegramService()

cron.schedule('* */6 * * *', async () => {
  console.log('🕒 Cron job started')

  try {
    const response = await axios.post(
      `${API_BASE_URL}:${API_BASE_PORT}/api/text-video/getParse`
    )

    const { title, description } = response.data
    console.log('📰 Новость:', title)

    const responseVideo = await axios.post(
      `${API_BASE_URL}:${API_BASE_PORT}/api/create-simple/getVideos`,
      { title, description }
    )

    const videoPath = responseVideo.data?.finalVideo

    console.log(videoPath)

    if (!videoPath || !fs.existsSync(videoPath)) {
      throw new Error('⚠️ Файл видео не найден или путь неверный')
    }

    await telegramService.sendVideo(videoPath, title)
  } catch (err) {
    console.error('❌ Ошибка при cron-выполнении:', err)
  }
})

app.use(cors())

app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || ''
  if (contentType.includes('multipart/form-data')) {
    return next()
  }

  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return res.status(400).json({ error: 'Invalid JSON' })
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next)
  })
})

app.use('/api', globalRouter)

export default app
