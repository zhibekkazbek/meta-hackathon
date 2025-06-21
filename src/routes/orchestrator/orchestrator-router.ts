import { Router } from 'express'
import axios from 'axios'
import fs from 'fs'
import { v4 as uuid } from 'uuid'
import { arrayBuffer } from 'stream/consumers'
import { getAudioDurationInSeconds } from 'get-audio-duration'
import { downloadVideo } from '../videos/utils/downloadVideo'

const orchestratorRouter = Router()

const API_BASE_URL = process.env.API_BASE_URL
const API_BASE_PORT = process.env.PORT

orchestratorRouter.post('/getVideos', async (req, res) => {
  try {
    const audioResponse = await axios.request({
      method: 'POST',
      url: `${API_BASE_URL}:${API_BASE_PORT}/api/audio-video/getAudio`,
      data: { mainText: req.body.description },
      responseType: 'arraybuffer'
    })
    console.log('Step 1 complete:', audioResponse.data)

    const audioFileId = `${uuid()}.mp3`
    const audioFilePath = `renderRemotion/public/${audioFileId}`

    fs.writeFileSync(audioFilePath, Buffer.from(audioResponse.data))

    const subtitlesResponse = await axios.post(
      `${API_BASE_URL}:${API_BASE_PORT}/api/subtitles-video/getSubtitles`,
      {
        audioLink: audioFilePath,
        mainSubtitles: req.body.description
      }
    )

    console.log('Step 2 complete:', subtitlesResponse.data)

    const duration = await getAudioDurationInSeconds(audioFilePath)

    const videoResponse = await axios.post(
      `${API_BASE_URL}:${API_BASE_PORT}/api/videos-video/getVideos`,
      {
        mainText: req.body.description,
        duration
      }
    )
    console.log('Step 3 complete:', videoResponse.data)

    interface VideoResult {
      link: string
      source: string
      id: string
      trimStart: number
      trimEnd: number
    }

    const videoResult: VideoResult[] = []
    for (const el of videoResponse.data) {
      const mainVideo = await downloadVideo(el.globalUrl)
      videoResult.push({
        link: mainVideo.url,
        source: el.source,
        id: mainVideo.id,
        trimStart: el.trimStart,
        trimEnd: el.trimEnd
      })
    }

    // {videoResult, audioLink, subtitlesLink}
    const renderResponse = await axios.request({
      method: 'POST',
      url: `${API_BASE_URL}:${API_BASE_PORT}/api/create-video/renderVideo`,
      data: {
        videoResult: videoResult,
        audioLink: audioFileId,
        subtitlesLink: subtitlesResponse.data.subtitlesLink
      }
    })

    const link = renderResponse.data.link

    console.log(link)

    // надо возвращять сам файл аудио и само финальное видео

    res.status(200).json({
      videoResult: videoResponse.data,
      audioLink: fs.readFileSync(audioFilePath),
      subtitlesLink: subtitlesResponse.data.subtitlesLink,
      finalVideo: link
    })

    fs.unlinkSync(audioFilePath)
    for (let el of videoResult) {
      fs.unlinkSync(el.link)
    }
  } catch (error) {
    console.error('Error executing APIs in sequence:', error)
    res.status(500).json({ error: 'Failed to execute API chain' })
  }
})

export default orchestratorRouter

// const {videoResult, audioLink, subtitlesLink, leaderVideo} = req.body;
