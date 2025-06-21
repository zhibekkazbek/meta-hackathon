import { Request, Response } from 'express'
import VideosService from './videos-service'

class VideosController {
  private videosService: VideosService

  constructor(videosService: VideosService) {
    this.videosService = videosService
  }

  async getVideos(req: Request, res: Response): Promise<void> {
    try {
      const { mainText, duration } = req.body

      const videos = await this.videosService.getVideos(mainText, duration)

      res.status(200).json(videos)
    } catch {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export default VideosController
