import { Router } from 'express'
import TextService from './text-service'
import TextController from './text-controller'

const textRouter = Router()

const textService = new TextService()
const textController = new TextController(textService)

textRouter.post('/getText', async (req, res) =>
  textController.getText(req, res)
)

textRouter.post('/getParse', async (req, res) => textController.getParse(res))

export default textRouter
