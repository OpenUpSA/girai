import { OpenAI } from 'openai'; // Add the import here
import { CoreMessage, generateText } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';

const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function searchFiles(vectorStoreIds: string[], query: string) {
  const response = await openaiInstance.responses.create({
    model: 'gpt-4o-mini',
    input: query,
    tools: [{
      type: 'file_search',
      vector_store_ids: vectorStoreIds,
      max_num_results: 2
    }],
    include: ["file_search_call.results"]
  });
  return response;
}

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();
  const vectorStoreIds = ["vs_67e3e69308e08191a5b7c073dbc88fcb"];
  const query = messages.map(msg => msg.content).join(' ');

  // let fileSearchResults: unknown = null;
  // try {
  //   fileSearchResults = await searchFiles(vectorStoreIds, query);
  // } catch (error) {
  //   console.error('Error during file search:', error);
  // }

  // const fileMessages: CoreMessage[] = [{
  //   role: 'system',
  //   content: `Results from fileSearch: ${fileSearchResults as {output_text: string}}`
  // }];

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
    tools: {
      web_search_preview: openai.tools.webSearchPreview({
        searchContextSize: 'medium',
        userLocation: { type: 'approximate' }
      }),
    },
    system: `
You are a helpful AI assistant for [The Global Index on Responsible AI](https://www.global-index.ai) website. 
You provide insights about AI governance, infrastructure, innovation, and skills across different countries. 
You only talk about AI, and no other topics.
The 2024 1st edition report can be downloaded from https://girai-report-2024-corrected-edition.tiiny.site/
You have access to files in the fileSearch vector store for querying:
- 2024-report.pdf - GIRAI 1st Edition report in PDF format
- 786561819-Global-Index-on-Responsible-AI-2024-Corrected-Edition.txt is a text version of the 2024-report.pdf file
- GIRAI_2024_Edition_Data.html - GIRAI 2024 Data in HTML tables
- GIRAI_2024_Edition_Dictionary.html - GIRAI 2024 Dictionary in HTML tables
- GIRAI_2024_Edition_Rankings_And_Scores.html - GIRAI 2024 Rankings and Scores in HTML tables
`,
    messages: [...messages],
  });

  return Response.json({ messages: gt.response.messages})//, output: gt.response.body.output });
}
