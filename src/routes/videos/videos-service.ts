import dotenv from 'dotenv'
import { getVideoTitles } from './utils/getVideoTitles'
import { getVideoLink } from './utils/getVideoLink'
import { hasTitle } from './utils/hasTitle'

dotenv.config()

class VideosService {
  async getVideos(text, duration) {
    const jsonResult = await getVideoTitles(text, duration)

    console.log(JSON.stringify(jsonResult))

    const videoPromises = jsonResult.map(async (res) => {
      try {
        const video = await getVideoLink(res.title, res.context)
        console.log('VIDEO: ' + video)

        if (video) {
          return {
            source: video.source,
            globalUrl: video.url,
            videoId: video.videoId,
            videoUrl: video.videoUrl
          }
        } else {
          const newVideo = await hasTitle(res.title, res.context)
          console.log('new: ' + newVideo)
          if (newVideo) {
            return {
              source: newVideo.source,
              globalUrl: newVideo.url,
              videoId: newVideo.videoId,
              videoUrl: newVideo.videoUrl
            }
          }
        }
      } catch (error) {
        console.error(`Error processing video for title: ${res.title}`, error)
        return null
      }
    })

    const results = await Promise.all(videoPromises)

    const videos = results.filter((video) => video !== null)
    const videoDuration = parseFloat((duration / videos.length).toFixed(1))

    const trimmedVideos = videos.map((video, index) => {
      const trimStart = index * videoDuration
      const trimEnd = trimStart + videoDuration
      return { ...video, trimStart, trimEnd }
    })

    console.log('Trimmed videos:', trimmedVideos)

    return trimmedVideos
  }
}

export default VideosService

//npx remotion lambda sites create src/index.ts --site-name=my-video
