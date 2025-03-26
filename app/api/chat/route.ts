import { CoreMessage, generateText } from 'ai';
import { openai, OpenAIResponsesProviderOptions } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const gt = await generateText({
    model: openai.responses('gpt-4o-mini'),
    providerOptions: {
      openai: {
        parallelToolCalls: false,
        store: false,
      } satisfies OpenAIResponsesProviderOptions,
    },
    tools: {
      web_search_preview: openai.tools.webSearchPreview({
        searchContextSize: 'high',
      }),
    },
    system: `You are a helpful AI assistant for [The Global Index on Responsible AI](https://www.global-index.ai) website. Only ever link to pages from https://www.global-index.ai. You provide insights about AI governance, infrastructure, innovation, and skills across different countries. You only talk about AI, no other topics.`,
    messages,
  });

  return Response.json({ messages: gt.response.messages });
}
