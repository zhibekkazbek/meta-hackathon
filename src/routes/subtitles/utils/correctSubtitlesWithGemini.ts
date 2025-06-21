import { textModel } from "../../../config/modelConfig";

export async function correctSubtitlesWithGemini(subtitles: any, original: string) { 
    const promptFullText = ` Тупой не вставляй этот текст в финальный ответ. Never don't add ** or *. Это весь текст субтитров с ошибками: ${subtitles}.  Never don't add symbols ** or *. Never don't add symbols ** or *. Never don't add symbols ** or *. Never don't add symbols ** or *. Не добавляй символы ** никуда. И не добавляй символ кавычек "Тильда" и удаляй их если видишь.
    А здесь полный текст без ошибок: ${original}. Твоя задача заменить только слова из неправильного текста на слова из правильного. И не добавлять никуда символы **. Самое важное не добавлять символы **.  возвращать ты должен текст в том же формате, например: 1
    00:00:00,148 --> 00:00:03,570
    В Актобе суд обязал курьера выплатить 3 миллиона тенге-пенсионерке,
    
    2
    00:00:03,610 --> 00:00:07,211
    ставшей жертвой мошенников. Как стало известно из материалов дела,`;
    
    try {
      const promptResult = await textModel.generateContent(promptFullText);
      const text = promptResult.response.text();
      return text
    } catch (error) {
      throw new Error(`Failed to correct subtitles: ${error}`);
    }
}