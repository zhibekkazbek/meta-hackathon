import { Router } from 'express'
import VideosService from './videos-service'
import VideosController from './videos-controller'

const videosRouter = Router()

const videosService = new VideosService()
const videosController = new VideosController(videosService)

videosRouter.post('/getVideos', async (req, res) =>
  videosController.getVideos(req, res)
)

export default videosRouter
