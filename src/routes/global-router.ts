import { Router } from 'express'
import textRouter from './text/text-router'
import renderRouter from './render/render-router'
import audioRouter from './audio/audio-router'
import subtitlesRouter from './subtitles/subtitles-router'
import videosRouter from './videos/videos-router'
import orchestratorRouter from './orchestrator/orchestrator-router'

const globalRouter = Router()

globalRouter.use('/text-video', textRouter)
globalRouter.use('/audio-video', audioRouter)
globalRouter.use('/subtitles-video', subtitlesRouter)
globalRouter.use('/videos-video', videosRouter)
globalRouter.use('/create-video', renderRouter)

globalRouter.use('/create-simple', orchestratorRouter)

export default globalRouter
