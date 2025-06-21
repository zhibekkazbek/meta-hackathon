import { createClient } from 'pexels'
import dotenv from 'dotenv'
import { model } from '../../../config/modelConfig'
import axios from 'axios'
import qs from 'qs'

dotenv.config()

const client = createClient(process.env.PEXELS_API as string)

interface VideoSearchResult {
  videos: {
    image: string
    video_files: {
      link: string
      width: number
      quality: string
      id: number
    }[]
  }[]
}

export async function getVideoLink(query: string, context) {
  const imageParts: Array<any> = []

  const pexelsResponse = (await client.videos.search({
    query,
    size: 'large',
    orientation: 'landscape'
  })) as VideoSearchResult
  const pexelsResult = pexelsResponse.videos

  const pexelsLength = pexelsResponse.videos.length

  const fullArr: any = [...pexelsResult]

  if (fullArr.length > 0) {
    for (let i = 0; i < fullArr.length; i++) {
      try {
        const url = fullArr[i].image

        const part = await fileToGenerativePart(url, 'image/jpg')

        if (part && part.inlineData && part.inlineData.data) {
          imageParts.push(part)
        } else {
          console.warn(`Invalid part for URL: ${url}`)
        }
      } catch (error) {
        console.error(`Failed to process element. Skipping to the next.`)
        continue
      }
    }

    if (imageParts.length === 0) {
      console.error('No valid image parts available.')
      return null
    }

    const index = await findImageByParts(imageParts, query, context)

    let url: string | null = null
    let id

    let counter = 0

    pexelsResponse.videos[index].video_files.forEach((el, i) => {
      if (el.quality == 'hd') {
        url = el.link
        id = el.id
        counter++
      }
    })

    if (counter == 0) {
      url =
        pexelsResponse.videos[index].video_files[
          pexelsResponse.videos[index].video_files.length - 1
        ].link
      id =
        pexelsResponse.videos[index].video_files[
          pexelsResponse.videos[index].video_files.length - 1
        ].id
    }

    return { url: url, source: 'pexels', videoId: id, videoUrl: url }
  } else {
    return null
  }
}

async function fileToGenerativePart(path, mimeType) {
  const response = await axios.get(path, { responseType: 'arraybuffer' })
  const buffer = Buffer.from(response.data, 'binary')

  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    }
  }
}

async function findImageByParts(imageParts, query, context) {
  if (imageParts.length === 0) {
    throw new Error('imageParts is empty. Failed to generate any parts.')
  }

  const promptImages = `Найди наиболее подходящую заголовку: ${query} \n и учитывая контекст: ${context} \n картинку внимательно изучая каждую картинку не учитывая в каком порядке они поступают и верни ее индекс начиная отсчёт с 0.

    Всегда возвращай данные в виде:

    {
      "index": число
    }
      
    using this JSON schema:

    {
      "type": "object",
      "properties": {
        "index": { "type": "number" },
      }
    }
    `

  const maxAttempts = 10
  const delayTime = 30000

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const generatedContent = await model.generateContent([
        promptImages,
        ...imageParts
      ])

      const textResponse = await generatedContent.response.text()
      const finalVideo = JSON.parse(textResponse)

      console.log('finalVideo: ' + textResponse)
      console.log('index: ' + finalVideo.index)

      return finalVideo.index
    } catch (error) {
      if (isApiError(error) && error.status === 429) {
        console.error(
          `Error 429: Too Many Requests. Attempt ${attempt} of ${maxAttempts}`
        )

        if (attempt < maxAttempts) {
          console.log(`query: ${query}`)
          console.log(`Waiting ${delayTime / 1000} seconds before retrying...`)
          await delay(delayTime)
          continue
        } else {
          console.error(
            'Max attempts reached. Unable to process request due to quota limits.'
          )
          throw new Error('Quota exceeded. Please try again later.')
        }
      } else {
        console.error('Unexpected error occurred:', error)
        throw error
      }
    }
  }
}

function isApiError(error: unknown): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
