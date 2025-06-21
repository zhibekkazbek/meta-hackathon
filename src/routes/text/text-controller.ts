import { Request, Response } from 'express'
import TextService from './text-service'

class TextController {
  private textService: TextService

  constructor(textService: TextService) {
    this.textService = textService
  }

  async getText(req: Request, res: Response): Promise<void> {
    try {
      const { title, description } = req.body

      const fullText = await this.textService.getText(title, description)

      res.status(200).json(fullText)
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  async getParse(res: Response): Promise<void> {
    try {
      const parseText = await this.textService.getParse()
      const fullText = await this.textService.getText(
        parseText.title,
        parseText.description
      )

      res.status(200).json(fullText)
    } catch (error) {
      res.status(500).json({ message: 'Error with parsing' })
    }
  }
}

export default TextController
