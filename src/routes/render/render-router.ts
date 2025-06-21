import { Router } from 'express'
import RenderService from './render-service'
import RenderController from './render-controller'
import multer from 'multer'

const renderRouter = Router()

const renderService = new RenderService()
const renderController = new RenderController(renderService)

const upload = multer()

renderRouter.post('/renderVideo', async (req, res) =>
  renderController.startRender(req, res)
)

renderRouter.post(
  '/reRenderVideo',
  upload.fields([
    { name: 'audioLink', maxCount: 1 },
    { name: 'videoResult' },
    { name: 'subtitlesLink' }
  ]),
  async (req, res) => renderController.startReRender(req, res)
)

export default renderRouter
