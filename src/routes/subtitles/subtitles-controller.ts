import { Request, Response } from 'express';
import SubtitlesService from './subtitles-service';

class SubtitlesController {
  private subtitlesService: SubtitlesService;

  constructor(subtitlesService: SubtitlesService) {
    this.subtitlesService = subtitlesService;
  }

  async getSubtitles(req: Request, res: Response): Promise<void> {
    try {
        const {audioLink, mainSubtitles} = req.body;
  
        
        const subtitlesLink = await this.subtitlesService.getSubtitles(audioLink, mainSubtitles);

      res.status(200).json(subtitlesLink);
    } catch (error) {
      res.status(500).json({ message: "Internal server error"});
    }
  }


}

export default SubtitlesController;