import { NextResponse } from 'next/server';
import { DEFAULT_MODELS } from '@/types/chat';

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ models: DEFAULT_MODELS });
    }

    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 }, // Cache model list for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ models: DEFAULT_MODELS });
    }

    const data = await res.json();
    const fetchedModels = data.data || [];

    // Combine standard models with additional top models from OpenRouter
    const formattedFetched = fetchedModels
      .slice(0, 30)
      .map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: m.id.split('/')[0]?.toUpperCase() || 'OpenRouter',
        description: m.description ? m.description.substring(0, 100) + '...' : 'Available on OpenRouter',
        contextLength: m.context_length ? `${Math.round(m.context_length / 1000)}k` : undefined,
      }));

    // Ensure default models are present at top
    const existingIds = new Set(DEFAULT_MODELS.map(m => m.id));
    const merged = [...DEFAULT_MODELS];

    for (const item of formattedFetched) {
      if (!existingIds.has(item.id)) {
        merged.push(item);
      }
    }

    return NextResponse.json({ models: merged });
  } catch (err) {
    return NextResponse.json({ models: DEFAULT_MODELS });
  }
}
