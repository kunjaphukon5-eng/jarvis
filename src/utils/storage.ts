import { ChatSession, UserSettings, DEFAULT_SETTINGS } from '@/types/chat';

const CHATS_KEY = 'jarvis_ultron_chats_v1';
const ACTIVE_CHAT_KEY = 'jarvis_ultron_active_chat_v1';
const SETTINGS_KEY = 'jarvis_ultron_settings_v1';

export const getStoredChats = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse chats from localStorage:', error);
    return [];
  }
};

export const saveStoredChats = (chats: ChatSession[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Failed to save chats to localStorage:', error);
  }
};

export const getActiveChatId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CHAT_KEY);
};

export const saveActiveChatId = (id: string | null): void => {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_CHAT_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  }
};

export const getStoredSettings = (): UserSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to parse settings from localStorage:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: UserSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export const generateId = (): string => {
  return 'chat_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
};

export const generateTitleFromMessage = (content: string): string => {
  const trimmed = content.trim().replace(/^[^a-zA-Z0-9]+/, '');
  if (!trimmed) return 'New Conversation';
  const firstLine = trimmed.split('\n')[0];
  if (firstLine.length > 36) {
    return firstLine.substring(0, 36) + '...';
  }
  return firstLine;
};
