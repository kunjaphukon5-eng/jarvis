import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, style = 'photorealistic' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      // Fallback procedural enhancer if no key
      return NextResponse.json({
        enhancedPrompt: `${prompt.trim()}, highly detailed, cinematic lighting, masterpiece, 8k resolution, photorealistic, sharp focus, octane render, dynamic composition`,
      });
    }

    const systemPrompt = `You are an expert AI prompt engineer specialized in photography and image synthesis models like FLUX, Midjourney, and Stable Diffusion.
Your task is to take the user's raw idea and expand it into a rich, detailed, visually breathtaking single-paragraph prompt.
Include:
- Subject details, textures, expression or posture
- Lighting (e.g. golden hour, volumetric fog, rim lighting, neon reflection)
- Environment and background atmosphere
- Camera optics and style (e.g. 35mm lens, f/1.8 depth of field, 8k UHD, cinematic film grain)
- DO NOT add conversational filler. ONLY return the enhanced prompt text directly.`;

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://jarvis-ultron-chat.vercel.app',
        'X-Title': 'Jarvis Prompt Reader Engine',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Style: ${style}. Enhance this raw prompt: "${prompt}"` }
        ],
        temperature: 0.7,
        max_tokens: 250,
      }),
    });

    if (!openRouterResponse.ok) {
      return NextResponse.json({
        enhancedPrompt: `${prompt.trim()}, ultra realistic, cinematic atmosphere, 8k resolution, intricate details, photorealistic lighting, masterpiece`,
      });
    }

    const data = await openRouterResponse.json();
    const enhanced = data.choices?.[0]?.message?.content?.trim() || prompt;

    return NextResponse.json({ enhancedPrompt: enhanced });
  } catch (err: any) {
    return NextResponse.json({
      enhancedPrompt: `${prompt}, high detail, 8k, cinematic lighting, masterpiece`,
    });
  }
}
