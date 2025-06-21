import { renderMedia, selectComposition } from '@remotion/renderer';
import { v4 as uuid } from "uuid";
import { rm } from 'fs/promises';
import dotenv from 'dotenv';
import {bundle} from '@remotion/bundler';
import path from 'path';

dotenv.config();

export async function renderVideo(inputProps, compositionId){
    try {
        let composition;
        const outputLocation = path.join(process.cwd(), `./out/${uuid()}.mp4`) ;

        const serveUrl = await bundle({
            entryPoint: path.join(process.cwd(), './renderRemotion/src/index.ts'),
            // If you have a webpack override in remotion.config.ts, pass it here as well.
            webpackOverride: (config) => config,
        });
        console.log(serveUrl);
        
  
          composition = await selectComposition({
            serveUrl,
            id: compositionId,
            inputProps,
          });
  
          await renderMedia({
              composition,
              serveUrl,
              codec: 'h264',
              outputLocation,
              inputProps,
              timeoutInMilliseconds: 6000000,
          });
  
          return {link: outputLocation};
    } catch (error) {
        console.log("Error: " + error);
        
        throw new Error('Failed to fetch videos');
    }
}