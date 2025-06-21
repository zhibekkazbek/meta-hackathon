import { QdrantClient } from '@qdrant/js-client-rest'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const fragments = JSON.parse(fs.readFileSync('./news.json', 'utf8'))

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
})

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function splitTextIntoChunks(text: string, maxChars = 1000): string[] {
  const sentences = text.split(/(?<=[.?!])\s+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += ' ' + sentence
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

export async function DBain() {
  console.log('🚀 Start uploading to Qdrant with OpenAI embeddings')

  await qdrant.recreateCollection('steppe_style', {
    vectors: { size: 1536, distance: 'Cosine' } // размер вектора text-embedding-3-small
  })

  const points: any[] = []
  let globalId = 1

  for (const item of fragments) {
    console.log(item.id)

    const chunks = splitTextIntoChunks(item.text)

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      try {
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: chunk
          // dimensions: 768 // можно указать меньше для оптимизации, но нужно явно создать такую коллекцию
        })

        const vector = embedding.data[0].embedding

        points.push({
          id: globalId++,
          vector,
          payload: {
            text: chunk,
            tag: item.tag || null
          }
        })

        console.log(`✅ Залито: ${item.id}-${i + 1}`)
      } catch (err) {
        console.error(`❌ Ошибка на ${item.id}-${i + 1}:`, err)
      }
    }
  }

  if (points.length > 0) {
    await qdrant.upsert('steppe_style', { points })
    console.log('✅ Всего фрагментов залито:', points.length)
  } else {
    console.warn('⚠️ Нет точек для вставки.')
  }
}
