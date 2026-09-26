import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, width = 1024, height = 1024 } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A valid text prompt is required for image generation.' },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();
    const seed = Math.floor(Math.random() * 10000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true&enhance=true`;

    // Verify image URL availability
    const res = await fetch(imageUrl, { method: 'HEAD' });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to generate AI image. Please try again with a different prompt.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: imageUrl,
      prompt: cleanPrompt,
      width,
      height,
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during image generation.' },
      { status: 500 }
    );
  }
}
