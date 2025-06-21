import { Request, Response } from 'express'
import RenderService from './render-service'
import fs from 'fs'
import { v4 as uuid } from 'uuid'
import { downloadVideo } from '../videos/utils/downloadVideo'

class RenderController {
  private renderService: RenderService

  constructor(renderService: RenderService) {
    this.renderService = renderService
  }

  async startRender(req: Request, res: Response): Promise<any> {
    try {
      const { videoResult, audioLink, subtitlesLink } = req.body

      const { link } = await this.renderService.startRender(
        videoResult,
        audioLink,
        subtitlesLink
      )

      res.json({ link })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async startReRender(req: Request, res: Response): Promise<any> {
    try {
      const { videoResult, subtitlesLink, leaderVideo } = req.body
      const audioBuffer = req.files?.['audioLink']?.[0]?.buffer

      if (!audioBuffer) {
        return res.status(400).json({ message: 'No audio file uploaded' })
      }

      const publicDir = `./renderRemotion/public`
      const fileName = `${uuid()}.mp3`

      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true })
      }

      const audioPath = `${publicDir}/${fileName}`
      fs.writeFileSync(audioPath, audioBuffer)

      interface VideoResult {
        link: string
        source: string
        id: string
        trimStart: number
        trimEnd: number
      }

      type InputVideo = {
        globalUrl: string
        source: string
        id: string
        trimStart: number
        trimEnd: number
      }

      const videoResultParsed: InputVideo[] = JSON.parse(videoResult)
      const videoResultNew: VideoResult[] = []

      for (const el of videoResultParsed) {
        const mainVideo = await downloadVideo(el.globalUrl)
        videoResultNew.push({
          link: mainVideo.url,
          source: el.source,
          id: mainVideo.id,
          trimStart: el.trimStart,
          trimEnd: el.trimEnd
        })
      }

      const { link } = await this.renderService.startRender(
        videoResultNew,
        fileName,
        subtitlesLink
      )

      res.status(200).json({ finalVideo: fs.readFileSync(link) })

      fs.unlinkSync(audioPath)
      fs.unlinkSync(link)
      for (let el of videoResultNew) {
        fs.unlinkSync(el.link)
      }
    } catch (error) {
      console.error('❌ Error in reRender:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default RenderController
