import { renderVideo } from './utils/renderVideo'

class RenderService {
  async startRender(videos, audioLink, subtitlesLink) {
    console.log(videos)
    console.log(audioLink)
    console.log(subtitlesLink)

    const compositionId = 'MyComp2'

    const inputProps = {
      audioLink,
      subtitlesLink,
      videos
    }

    const finalResult = await renderVideo(inputProps, compositionId)

    return finalResult
  }
}

export default RenderService

//npx remotion lambda sites create src/index.ts --site-name=my-video
