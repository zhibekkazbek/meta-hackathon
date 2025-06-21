import { QdrantClient } from '@qdrant/js-client-rest'
import { OpenAI } from 'openai'
import dotenv from 'dotenv'
import { escapeQuotesInsideValues } from './utils/escapeQuotesInsideValues'
import { textModelJSON } from '../../config/modelConfig'
import Parser from 'rss-parser'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { UsedNews } from '../../models/UsedNews'

dotenv.config()

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY
})

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

class TextService {
  async getText(title, description) {
    const query = `${title}. ${description}`

    // 🔹 Получаем вектор запроса
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })
    const queryVector = embeddingResponse.data[0].embedding

    // 🔹 Поиск в Qdrant
    const searchResult = await qdrant.search('steppe_style', {
      vector: queryVector,
      limit: 3,
      with_payload: true
    })

    const retrievedTexts = searchResult
      .map((item) => item.payload?.text)
      .filter(Boolean)
      .join('\n---\n')

    // 🔹 Генерация prompt-а
    const promptFullText = `
     Generate a text that combines the title and description from the input data, while:
      
        НЕ ИСПОЛЬЗУЙ ЗНАК ** В ТЕКСТЕ НИКОГДА
        DO NOT USE Quotation Marks NEVER
      
        1. Summarize the text, keeping only the main essence. Retain key points while cutting out secondary details and unnecessary specifics. All important quotes should be preserved without changes, but their length and wording can be adapted for brevity. The tone should remain respectful and neutral for serious topics; in other cases. It's very important.
        2. The summary must remain faithful to the key message, but feel free to make the language fun and accessible for the reader.
        3. The summary should be short, concise, and written in your own words, capturing the essence of the original text.
        4. Rewrite the original text to reduce it to one minute.
        5. Perform the rewrite strictly following the "inverted pyramid" principle for readability.
        6. KEEP QUOTES from officials and persons unchanged, although you may trim the beginning or end if it doesn't distort the meaning.
        7. When quoting direct speech, if the quoted paragraph is too long, you may split it into smaller paragraphs and PARAPHRASE CERTAIN PARTS, but the quote must always be included if it exists in the original text.
        8. EXCLUDE all references to images.
        9. DO NOT INCLUDE text after the phrases "читайте также" or "read on."
        10. ALL TEXT MUST BE IN RUSSIAN LANGUAGE.
        11. ADD HUMOR: Inject friendly, light-hearted humor or mild sarcasm when appropriate, but AVOID any jokes if the text involves criminal cases, accidents, or instances where people have suffered.
        12. NO JOKES ABOUT THE PRESIDENT OF KAZAKHSTAN, KASSYM-JOMART TOKAYEV.
        13. Respect context: jokes should be aimed at making the text more engaging without undermining the facts or seriousness where necessary.
        14. DO NOT USE Quotation Marks NEVER
      
      What Not To Do
      - DO NOT add humor in cases of criminal investigations, accidents, or sensitive topics involving harm to individuals.
      - NEVER make jokes about the President of Kazakhstan, Kassym-Jomart Tokayev, or his administration.
      - AVOID distorting the meaning of quotes from officials or key figures.
      - DO NOT include references to images or external links.
      - AVOID overloading the text with jokes or sarcasm that distracts from the core message or facts.
      - DO NOT USE Quotation Marks NEVER
      
      Вот примеры строго в каком стиле генерировать текст:
${retrievedTexts}


      Edge Cases
      - For serious, fact-driven reports, such as natural disasters or tragic incidents, KEEP THE TONE NEUTRAL and respectful.
      - When referencing specific figures or direct statements, make sure humor does not overshadow the key information.
Теперь сгенерируй текст на основе следующего:

{
  "title": "${title}.",
  "description": "${description}"
}

      using this JSON schema:
      
      {
        "type": "object",
        "properties": {
          "description": { "type": "string" },
        }
    `

    try {
      const promptResult = await textModelJSON.generateContent(promptFullText)

      let text = promptResult.response.text()
      text = escapeQuotesInsideValues(text)

      const jsonResult = JSON.parse(text)
      return jsonResult
    } catch (error) {
      console.error('❌ Ошибка генерации:', error)
      return null
    }
  }

  async getParse(): Promise<{ title: string; description: string }> {
    const parser = new Parser()
    const feed = await parser.parseURL('https://feeds.bbci.co.uk/news/rss.xml')

    const usedTitles = await UsedNews.find().distinct('title')

    const news = feed.items
      .filter((item) => item.title && !usedTitles.includes(item.title))
      .slice(0, 20)
      .map((item) => ({
        title: item.title!,
        link: item.link!
      }))

    if (news.length === 0) throw new Error('🛑 Нет новых новостей')

    const promptFullText = `
    Есть список новостей, надо выбрать одну из наиболее подходящих для создания популярного видео в Казахстане. В приоритете нововсти как либо влияющие на население стран СНГ и Казахстана в частности. Вернуть нужно индекс новости которую ты выбрал начиная отсчет с 0 и title - заголовок той новости индекс которой ты взял

    Список Новостей: 
    ${JSON.stringify(news)}

    return {index: number,
    title: string}
    `

    const getIndex = (
      await textModelJSON.generateContent(promptFullText)
    ).response.text()

    const index = JSON.parse(getIndex).index
    const link = news[index]?.link

    if (!link) throw new Error(`⚠️ Ссылка не найдена для индекса ${index}`)

    const { data } = await axios.get(link)
    const $ = cheerio.load(data)

    const paragraphs: string[] = []

    $('p.sc-9a00e533-0').each((_, el) => {
      const text = $(el).text().trim()
      if (text) paragraphs.push(text)
    })

    const finalDescr = paragraphs.join('\n\n')

    // ✅ сохраняем заголовок
    await UsedNews.create({ title: news[index].title })

    return {
      title: news[index].title || '',
      description: finalDescr
    }
  }
}

export default TextService
