import { NextRequest, NextResponse } from 'next/server';



export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages, model = 'openai/gpt-4o-mini', temperature = 0.7, systemPrompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages array provided.' },
        { status: 400 }
      );
    }

    // Prepare full message list including system prompt
    const formattedMessages = [];

    if (systemPrompt && systemPrompt.trim()) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt.trim(),
      });
    }

    // Format input messages
    for (const msg of messages) {
      if (msg.role && msg.content) {
        formattedMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://jarvis-ultron-chat.vercel.app',
        'X-Title': 'Jarvis Ultron AI Assistant',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        stream: true,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
      }),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      let errorMessage = `OpenRouter API error: ${openRouterResponse.status} ${openRouterResponse.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        if (errorText) errorMessage += ` - ${errorText}`;
      }
      return NextResponse.json({ error: errorMessage }, { status: openRouterResponse.status });
    }

    // Create a TransformStream to process OpenRouter SSE chunks
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openRouterResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed.startsWith(':')) continue;

              if (trimmed === 'data: [DONE]') {
                controller.close();
                return;
              }

              if (trimmed.startsWith('data: ')) {
                const dataStr = trimmed.substring(6);
                try {
                  const json = JSON.parse(dataStr);
                  const contentChunk = json.choices?.[0]?.delta?.content;
                  if (contentChunk) {
                    controller.enqueue(encoder.encode(contentChunk));
                  }
                } catch {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.length > 0) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const json = JSON.parse(trimmed.substring(6));
                const contentChunk = json.choices?.[0]?.delta?.content;
                if (contentChunk) {
                  controller.enqueue(encoder.encode(contentChunk));
                }
              } catch {
                // ignore
              }
            }
          }
        } catch (error) {
          console.error('Error reading stream from OpenRouter:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Unexpected chat API error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
