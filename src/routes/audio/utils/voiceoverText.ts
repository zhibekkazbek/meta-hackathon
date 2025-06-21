import { ElevenLabsClient } from "elevenlabs";
import { createWriteStream } from "fs";

import { v4 as uuid } from "uuid";
import * as dotenv from "dotenv";

dotenv.config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

async function voiceoverText(description: string, publicDir): Promise<any> {

    return new Promise<any>(async (resolve, reject) => {
      try {
        const audio = await client.generate({
          voice: "tengriProf",
          model_id: "eleven_multilingual_v2",
          text: description,
          voice_settings: {
            stability: 0.2,
            similarity_boost: 0.7,
          },
        });
        const fileId = uuid()
        const fileName = `${publicDir}/${fileId}.mp3`;
        const fileStream = createWriteStream(fileName);
  
        audio.pipe(fileStream);
        fileStream.on("finish", () => resolve({fileId, fileName}));
        fileStream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
}

export { voiceoverText }