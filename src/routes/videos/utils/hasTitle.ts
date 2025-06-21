import { model, smartModel, textModel } from "../../../config/modelConfig";
import { getVideoLink } from "./getVideoLink";

export async function hasTitle(title: string,context: string, attempts = 0, maxAttempts = 20) {

    if (attempts >= maxAttempts) {
      throw new Error('Max attempts reached, unable to generate a valid title.');
    }
  
    try {
      const result = await textModel.generateContent(`Generate a unique and clear title that is different from 'undefined', 'untitled', or similar vague terms. The title should be simple and meaningful. Title should be even simpler than ${title}. Reduce the number of words. You need just write word, without anything. On English`);
      
      const text = await result.response.text();
  
      if (!text) {
        throw new Error('No title found in response.');
      }
  
      const video = await getVideoLink(text, context);

      
      
      if (video) {
        return video;
      } else {
        return await hasTitle(text, context, attempts + 1); 
      }
    } catch (error) {
      console.error(error);
      return null; 
    }
  }
  