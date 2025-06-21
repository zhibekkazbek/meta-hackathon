import { model, smartModel, textModel } from "../../../config/modelConfig";

export async function getVideoTitles(fullText: string, duration: number): Promise<{title: string, context: string}[]> {
    const segmentDuration = 5;
    const totalSegments = Math.ceil(duration / segmentDuration);
    const textSegments = splitTextIntoSegments(fullText, totalSegments);
    
    const videos: {title: string, context: string}[] = [];
    let previousContext = '';
    
    for (let i = 0; i < textSegments.length; i++) {
      const segment = textSegments[i];
  
      const videoTitles = videos.map(video => video.title);
      
      const prompt = `
  IMPORTANT: RETURN TITLE ONLY IN ENGLISH. THE TITLE MUST BE GENERATED AND RETURNED IN ENGLISH ONLY. 
  
  YOU ARE A VIDEO SEGMENTATION AND TITLE GENERATION EXPERT, SPECIALIZING IN THE ANALYSIS OF ENGLISH VIDEO CONTENT. YOUR TASK IS TO GENERATE THE MOST RELEVANT, CONCISE TITLES THAT PERFECTLY MATCH THE SUBTITLES' THEMATIC CONTENT AND CONTEXT.
  
  TASK TEMPLATE
  
  Task: 
    Based on the following previous segments, generate a title for the current text segment. The title should be clear, short (two words), and directly reflect the content of the current segment, while maintaining the storyline from the previous segments. Only in English. Do not repeat the titles from the Previous array of titles. Не повторяй старые заголовки.
  
  - Previous array of titles: ${videoTitles.join(', ')}
  - Previous segments context: "${previousContext}"
  - Current segment: "${segment}"
  
  Return only the title as plain text, not as an object.
  
  INSTRUCTIONS
  
  1. ANALYZE THE CONTEXT:
     - THOROUGHLY ASSESS the provided previous segments to understand the storyline or central theme.
     - IDENTIFY any patterns, recurring ideas, or the tone of the overall content.
  
  2. IDENTIFY THE CURRENT SEGMENT'S CORE THEME:
     - EXAMINE the current segment and DETERMINE its main idea.
     - CROSS-REFERENCE this main idea with the previous context to MAINTAIN consistency in narrative or theme.
  
  3. GENERATE A TITLE:
     - CREATE a short (2 words) title that is a precise reflection of the current segment’s content. Title should be main object of context. for example: if segment Умер огурец. Это печально, но такое бывает. Может, пора выращивать помидоры? than you shuold genearte title: огурец лежит
     - AVOID repeating any of the titles from the provided list of previously generated titles.
     - DON'T REPEAT THE TITLES FROM THE ARRAY: ${videoTitles.join(', ')}
  
  4. HANDLE EDGE CASES:
     - IF the current segment is too general or vague, USE the broader theme or main idea from the previous context to help GUIDE the title generation.
     - IF the current segment is redundant or repeats the previous segment, GENERATE a title that VARIES slightly while still capturing the essence of the new information.
  
  EXAMPLES:
  
  - Previous array of titles: ["Nature", "Mountains"]
  - Previous context: "A story about a hike through mountainous terrain, with a full description of mountain peaks."
  - Current segment: "We continued along the river, enjoying the sound of the water."
    Generated title: "river flowing"
  
  CHAIN OF THOUGHTS
  
  1. UNDERSTAND: Review the previous context to ensure you grasp the storyline or thematic elements.
  2. BASICS: Identify the core concept of the current segment.
  3. BREAK DOWN: Cross-reference with the previous array of titles to ensure you do not repeat any titles.
  4. ANALYZE: Focus on extracting the central idea of the current segment, even if it is implicit.
  5. BUILD: Generate a title that captures the current segment’s essence, but is also informed by the broader narrative.
  6. EDGE CASES: In case of overlap or vagueness, make sure the title still introduces a new, relevant element while avoiding redundancy.
  7. FINAL TITLE: Ensure the title is clear, concise, and aligns with both the current segment and previous storyline.
  
  What Not To Do
  - NEVER generate overly broad or vague titles that do not directly reflect the segment's content.
  - NEVER repeat or recycle titles from the previous array.
  - NEVER ignore the broader context when crafting the title.
  - NEVER create long or overly descriptive titles; keep them concise.
  - NEVER repeat the titles from the Previous array of titles.
  - AVOID generating titles that seem disconnected from the previous or current segment.
  
  return result in JSON format ON ENGLISH ON ENGLISH ON ENGLISH:
  
  {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
    }
  }
  
  example:
  
  {"title": "River"}
  
      `;
  
      try {
        const promptResult = await model.generateContent(prompt);
        const textResult = await promptResult.response.text().trim();
  
        const finalTitle = JSON.parse(textResult)
        videos.push({
          "title": finalTitle.title,
          "context": segment
        });
  
        previousContext += ` ${segment}`;
        
      } catch (error) {
        console.error(`Ошибка при обработке сегмента текста: ${error}`);
      }
    }
    
    return videos;
}

function splitTextIntoSegments(fullText: string, totalSegments: number): string[] {
  const segmentLength = Math.ceil(fullText.length / totalSegments);
  const segments: string[] = [];
  for (let i = 0; i < fullText.length; i += segmentLength) {
    segments.push(fullText.slice(i, i + segmentLength));
  }
  return segments;
}