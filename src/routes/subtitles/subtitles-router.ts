
import { Router } from 'express';
import SubtitlesService from './subtitles-service';
import SubtitlesController from './subtitles-controller';


const subtitlesRouter = Router();
  
const subtitlesService = new SubtitlesService();
const subtitlesController = new SubtitlesController(subtitlesService);

subtitlesRouter.post('/getSubtitles', async (req, res) => subtitlesController.getSubtitles(req, res));

export default subtitlesRouter;