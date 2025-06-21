import app from './app'
import dotenv from 'dotenv'
import { DBain } from './upload-vector-db'

// Загружаем переменные окружения
dotenv.config()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  //   DBain()
})
