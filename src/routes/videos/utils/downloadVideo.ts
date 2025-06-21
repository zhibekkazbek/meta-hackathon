import { v4 as uuid } from "uuid";
import { promises as fsP } from 'fs';
import path from 'path'
import {createWriteStream } from 'fs'
import https from 'https'

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)

export async function downloadVideo(downloadLink: string): Promise<any> {
  console.log(downloadLink);
  
    const outputFilePath = `./generate/${uuid()}.mp4`;
  
    await fsP.mkdir(path.dirname(outputFilePath), { recursive: true });
  
    const filepath = await downloadFileWithTimeout(downloadLink, outputFilePath, 6000000)
    .then((filePath) => {return filePath})
    .catch((err) => console.error(err));

    const outputSmallFileId = `${uuid()}.mp4`
  
    const outputSmallFilePath = `./renderRemotion/public/${outputSmallFileId}`
  
    await cutVideo(filepath, outputSmallFilePath);
  
    await fsP.unlink(outputFilePath);
    
    return {url: outputSmallFilePath, id: outputSmallFileId};
}

function downloadFileWithTimeout(url, outputFilePath, timeoutDuration = 300000) {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(outputFilePath);
      const request = https.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve(outputFilePath);
          });
        } else {
          reject(new Error(`Ошибка: статус ответа ${response.statusCode}`));
        }
      });
  
      request.setTimeout(timeoutDuration, () => {
        request.abort();
        reject(new Error(`Ошибка: сервер не отправил данные в течение ${timeoutDuration / 1000} секунд`));
      });
  
      request.on('error', (err) => {
        reject(new Error(`Ошибка при загрузке: ${err.message}`));
      });
    });
}

function cutVideo(filepath, outputSmallFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(filepath)
            .setStartTime('00:00:01')
            .setDuration('10')
            .output(outputSmallFilePath)
            .on('end', function() {
            resolve(outputSmallFilePath);
            })
            .on('error', function(err) {
            console.log('error: ', err);
            reject(err);
            })
            .run();
    });
}
  