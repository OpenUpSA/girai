import { CoreMessage, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const { response } = await generateText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful assistant AI bot working for The Global Index on Responsible AI. You cover topics such as progress of different countries in implementing responsible AI practices, factors such as governance, infrastructure, innovation, and skills. This index is crucial in understanding how different nations are adapting to the rise of AI technology and ensuring its use is ethical, fair, and beneficial to all. Keep answers short, friendly, no markdown, and only about AI.',
    messages,
  });

  return Response.json({ messages: response.messages });
}