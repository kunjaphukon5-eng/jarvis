import { NextRequest, NextResponse } from 'next/server';

const STYLE_MODIFIERS: Record<string, string> = {
  photorealistic: '8k UHD photograph, shot on 35mm lens, f/1.8 aperture, natural skin texture, realistic reflections, photorealistic lighting, masterpiece',
  cinematic: 'cinematic still, anamorphic lens, dramatic chiaroscuro lighting, IMAX 70mm, atmospheric haze, movie color grading',
  cyberpunk: 'futuristic cyberpunk aesthetic, neon glow, reflective rain puddles, holographic displays, dark synthwave tones, intricate cybernetics',
  anime: 'modern high-budget anime artstyle, Makoto Shinkai aesthetic, vibrant colors, detailed line art, dynamic lighting, 4k anime wallpaper',
  fantasy: 'epic high fantasy digital art, ethereal magical atmosphere, volumetric mist, intricate ornate details, dramatic composition',
  unreal: 'Unreal Engine 5 render, raytraced ambient occlusion, subsurface scattering, octane render 8k, hyperdetailed 3D model',
  vintage: 'vintage 35mm film photograph, nostalgic grain, Kodak Portra 400 colors, authentic analog softness, subtle lens flare',
  portrait: 'professional studio portrait photography, softbox lighting, sharp facial focus, bokeh background, Hasselblad 100MP camera',
};

const ASPECT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720, height: 1280 },
  '4:3': { width: 1024, height: 768 },
  '3:2': { width: 1080, height: 720 },
};

const LIGHTING_MODIFIERS: Record<string, string> = {
  volumetric: 'volumetric god rays, atmospheric dust motes, dramatic beam lighting',
  studio: 'professional softbox studio lighting, three-point lighting, rim light',
  golden_hour: 'warm golden hour sunset lighting, soft glowing amber highlights',
  neon: 'vibrant multi-color neon edge lights, glowing luminescent accents',
  natural: 'crisp diffuse daylight, natural shadow falloff, realistic ambient occlusion',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      style = 'photorealistic',
      aspectRatio = '1:1',
      lighting,
      negativePrompt,
      seed = Math.floor(Math.random() * 100000000),
      engine = 'flux',
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'A valid text prompt is required for photo generation.' },
        { status: 400 }
      );
    }

    const cleanPrompt = prompt.trim();

    // Compose detailed final prompt
    const parts = [cleanPrompt];

    if (style && STYLE_MODIFIERS[style]) {
      parts.push(STYLE_MODIFIERS[style]);
    }

    if (lighting && LIGHTING_MODIFIERS[lighting]) {
      parts.push(LIGHTING_MODIFIERS[lighting]);
    }

    const fullPrompt = parts.join(', ');

    // Resolution calculation
    const dimensions = ASPECT_DIMENSIONS[aspectRatio] || { width: 1024, height: 1024 };
    const { width, height } = dimensions;

    // Model selection
    const selectedModel = engine === 'turbo' ? 'turbo' : 'flux';

    // Construct image URL using Pollinations FLUX Engine
    let imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${width}&height=${height}&seed=${seed}&model=${selectedModel}&nologo=true&enhance=true`;

    if (negativePrompt && typeof negativePrompt === 'string' && negativePrompt.trim()) {
      imageUrl += `&negative=${encodeURIComponent(negativePrompt.trim())}`;
    }

    return NextResponse.json({
      url: imageUrl,
      prompt: cleanPrompt,
      fullPrompt,
      width,
      height,
      seed,
      style,
      engine: selectedModel,
      aspectRatio,
    });
  } catch (error: any) {
    console.error('Detailed Photo generator error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred during photo generation.' },
      { status: 500 }
    );
  }
}
