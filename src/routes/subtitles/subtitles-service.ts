import dotenv from 'dotenv';
import OpenAI from "openai";
import fs from 'fs-extra';
import { createSubtitleSegments } from './utils/createSubtitleSegments';
import { correctSubtitlesWithGemini } from './utils/correctSubtitlesWithGemini';

dotenv.config();

const openai = new OpenAI();

class SubtitlesService {
  async getSubtitles(audioLocal, text){
  
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioLocal),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["word"]
    });
  
    const subtitles = createSubtitleSegments(transcription.words);
  
    const correctedSubtitles = await correctSubtitlesWithGemini(subtitles, text);
    return {subtitlesLink: correctedSubtitles}
  }
}

export default SubtitlesService;

//npx remotion lambda sites create src/index.ts --site-name=my-video