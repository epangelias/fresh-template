import { handleSSE } from './handle-sse.ts';
import { ChatCompletionChunk } from 'https://deno.land/x/openai@v4.28.0/resources/mod.ts';
import { Stream } from 'https://deno.land/x/openai@v4.28.0/streaming.ts';
import { AIMessage, OAIOptions } from '@/lib/types.ts';
import { generateChatCompletions } from '@/lib/oai.ts';

export function handleAIResponse(messages: AIMessage[], options?: OAIOptions, onEnd = (_messages: AIMessage[]) => { }) {
    let stream: Stream<ChatCompletionChunk>;

    return handleSSE(async (send) => {
        stream = await generateChatCompletions(options, messages);

        let content = '';

        for await (const token of stream) {
            content += token.choices[0].delta.content;
            send(token.choices[0].delta.content);
        }

        send(null);

        onEnd([...messages, { role: 'assistant', content }]);
    }, () => {
        stream.controller.abort();
    });
}