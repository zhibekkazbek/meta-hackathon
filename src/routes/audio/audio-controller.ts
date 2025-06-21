import { Request, Response } from 'express';
import AudioService from './audio-service';
import fs from 'fs';

class AudioController {
  private audioService: AudioService;

  constructor(audioService: AudioService) {
    this.audioService = audioService;
  }

  async getAudio(req: Request, res: Response): Promise<void> {
    try {
        const {mainText} = req.body;
        
        const audioLocal = await this.audioService.getAudio(mainText);

        res.download(audioLocal.fileName, (err) => {
          if (err) {
              console.error("Ошибка при отправке файла:", err);
              return res.status(500).json({ error: "Ошибка при отправке файла" });
          }

          fs.unlink(audioLocal.fileName, (err) => {
            if (err) console.error("Ошибка при удалении файла:", err);
          });
        });
    } catch (error) {
      console.error('Внутренняя ошибка сервера:', error);
      res.status(500).json({ message: "Internal server error"});
    }
  }


}

export default AudioController;