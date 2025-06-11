import { OpenAI } from 'openai'
import { CoreMessage, generateText } from 'ai'
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai'
import { inspect } from 'util'

inspect.defaultOptions.depth = null

type FileSearchResult = {
  output: {
    results: {
      text: string
    }[]
  }[]
}

const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function searchFiles(vectorStoreIds: string[], query: string) {
  const response = await openaiInstance.responses.create({
    model: 'gpt-4o-mini',
    input: query,
    tools: [{
      type: 'file_search',
      vector_store_ids: vectorStoreIds,
      max_num_results: 3
    }],
    include: ["file_search_call.results"]
  })
  console.log(inspect(response))
  return response
}

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json()
  const vectorStoreIds = process.env.OPENAI_VECTOR_STORE_ID ? [process.env.OPENAI_VECTOR_STORE_ID] : []
  const query = messages.map(msg => msg.content).join(' ')

  let fileSearchResults: unknown = null
  try {
    fileSearchResults = await searchFiles(vectorStoreIds, query)
  } catch (error) {
    console.error('Error during file search:', error)
  }

  const results = fileSearchResults as FileSearchResult
  const searchOutput = results?.output?.[0]?.results
    ?.map((res, i) => `Result ${i + 1}:\n${res.text}`)
    ?.join('\n\n') || ''

  const fileMessages: CoreMessage[] = [{
    role: 'system',
    content: `Here are the relevant file search results:\n\n${searchOutput}`
  }]

  const gt = await generateText({
    model: openai.responses('gpt-4o-mini'),
    maxTokens: 2048,
    temperature: 1,
    topP: 1,
    providerOptions: {
      openai: {
        store: true,
      } satisfies OpenAIResponsesProviderOptions,
    },
    system: `
You are a helpful AI assistant for [The Global Index on Responsible AI](https://www.global-index.ai) website. 
You provide insights about AI governance, infrastructure, innovation, and skills across different countries. 
You only talk about AI and no other topics.
The 2024 1st edition report can be downloaded from https://girai-report-2024-corrected-edition.tiiny.site/
You have many files in a vector store to use to answer specific questions.
`,
    messages: [...messages, ...fileMessages],
  })

  return Response.json({ messages: gt.response.messages })
}
