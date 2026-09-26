export type Role = 'user' | 'assistant' | 'system';

export interface ImageAttachment {
  url: string;
  title?: string;
  source?: string;
  isGenerated?: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  updatedAt?: number;
  isError?: boolean;
  modelUsed?: string;
  images?: ImageAttachment[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model: string;
  systemPrompt?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  badge?: string;
  contextLength?: string;
  recommended?: boolean;
}

export interface UserSettings {
  theme: 'dark' | 'light';
  defaultModel: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  sendOnEnter: boolean;
}

export const DEFAULT_MODELS: ModelOption[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Ultra-fast, intelligent, and highly efficient for everyday tasks.',
    badge: 'Fast & Smart',
    contextLength: '128k',
    recommended: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Industry-leading reasoning, coding, and precise instruction following.',
    badge: 'Best Reasoning',
    contextLength: '200k',
    recommended: true,
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'State-of-the-art open-weights model for programming and logic.',
    badge: 'Coding Champion',
    contextLength: '64k',
    recommended: true,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'Meta flagship open model with excellent versatility.',
    badge: 'Open Source',
    contextLength: '128k',
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Lightning-fast speed with vast knowledge capability.',
    badge: 'Ultra Fast',
    contextLength: '1M',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o Flagship',
    provider: 'OpenAI',
    description: 'Top-tier multimodal intelligence for complex problem solving.',
    badge: 'Flagship',
    contextLength: '128k',
  }
];

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  defaultModel: 'openai/gpt-4o-mini',
  systemPrompt: 'You are Jarvis, an advanced, polite, highly capable AI assistant powered by Ultron Intelligence. Provide clear, accurate, beautifully formatted answers with markdown syntax and precise code snippets when applicable.',
  temperature: 0.7,
  maxTokens: 4096,
  sendOnEnter: true,
};
