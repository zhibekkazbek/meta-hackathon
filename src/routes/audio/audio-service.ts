import dotenv from 'dotenv';
import { voiceoverText } from './utils/voiceoverText';
import fs from 'fs'

dotenv.config();

class AudioService {
    async getAudio(text){

        const publicDir = `./renderRemotion/public/`;

        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        console.log("start audio");
        

        const audioLocal = await voiceoverText(text, publicDir);
        
        if(audioLocal){
            return audioLocal
        }
        else {
            throw new Error('Ошибка генерации аудиофайла');
        }
    }
}

export default AudioService;

//npx remotion lambda sites create src/index.ts --site-name=my-video