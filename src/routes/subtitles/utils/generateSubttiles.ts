

import fs from 'fs-extra';
import dotenv from 'dotenv';
import { v4 as uuid } from "uuid";
import { rm } from 'fs/promises';
import path from 'path';
import OpenAI from "openai";
import { downloadAudioFile } from './downloadAudioFile';
import { createSubtitleSegments } from './createSubtitleSegments';
import { correctSubtitlesWithGemini } from './correctSubtitlesWithGemini';

dotenv.config();

const openai = new OpenAI();



const generateSubtitles = async (audioUrl: string, original: string) => {
  const pathAudio = `generate/${uuid()}.mp3`;
  await fs.mkdir(path.dirname(pathAudio), { recursive: true });

  await downloadAudioFile(audioUrl, pathAudio);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(pathAudio),
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word"]
  });

  const subtitles = createSubtitleSegments(transcription.words);

  const correctedSubtitles = await correctSubtitlesWithGemini(subtitles, original);

  const subtitlesPath = `generate/${uuid()}.srt`;

  await fs.mkdir(path.dirname(subtitlesPath), { recursive: true });
  
  await fs.writeFile(subtitlesPath, correctedSubtitles);

  await rm(pathAudio, { recursive: true, force: true });

  return subtitlesPath;
};

export { generateSubtitles };