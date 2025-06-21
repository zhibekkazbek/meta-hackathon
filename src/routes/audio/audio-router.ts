import { Router } from 'express';
import AudioService from './audio-service';
import AudioController from './audio-controller';


const audioRouter = Router();
  
const audioService = new AudioService();
const audioController = new AudioController(audioService);

audioRouter.post('/getAudio', async (req, res) => audioController.getAudio(req, res));

export default audioRouter;