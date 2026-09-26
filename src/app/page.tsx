'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatSession,
  Message,
  UserSettings,
  ModelOption,
  DEFAULT_MODELS,
  DEFAULT_SETTINGS
} from '@/types/chat';
import {
  getStoredChats,
  saveStoredChats,
  getActiveChatId,
  saveActiveChatId,
  getStoredSettings,
  saveStoredSettings,
  generateId,
  generateTitleFromMessage
} from '@/utils/storage';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { ChatArea } from '@/components/ChatArea';
import { ChatInput, InputMode } from '@/components/ChatInput';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('CHAT');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [currentModel, setCurrentModel] = useState<string>(DEFAULT_SETTINGS.defaultModel);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>(DEFAULT_MODELS);
  const [isLoaded, setIsLoaded] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize data from LocalStorage
  useEffect(() => {
    const loadedChats = getStoredChats();
    const loadedSettings = getStoredSettings();
    const savedActiveId = getActiveChatId();

    setSettings(loadedSettings);
    setCurrentModel(loadedSettings.defaultModel);

    // Apply theme
    if (loadedSettings.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    if (loadedChats.length > 0) {
      setSessions(loadedChats);
      const validActive = loadedChats.find((s) => s.id === savedActiveId);
      setActiveSessionId(validActive ? validActive.id : loadedChats[0].id);
    } else {
      // Create initial session
      const newSession: ChatSession = {
        id: generateId(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: loadedSettings.defaultModel,
      };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
      saveStoredChats([newSession]);
      saveActiveChatId(newSession.id);
    }

    setIsLoaded(true);

    // Fetch dynamic models list from server API
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.models && Array.isArray(data.models)) {
          setAvailableModels(data.models);
        }
      })
      .catch(() => {
        // Fallback to defaults
      });
  }, []);

  // Sync sessions to LocalStorage when modified
  useEffect(() => {
    if (isLoaded) {
      saveStoredChats(sessions);
    }
  }, [sessions, isLoaded]);

  // Sync activeSessionId to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      saveActiveChatId(activeSessionId);
    }
  }, [activeSessionId, isLoaded]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Create New Chat
  const handleNewChat = () => {
    if (isStreaming) handleStopStreaming();
    const newSession: ChatSession = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: currentModel,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput('');
    setInputMode('CHAT');
  };

  // Switch Active Session
  const handleSelectSession = (id: string) => {
    if (isStreaming) handleStopStreaming();
    setActiveSessionId(id);
    const target = sessions.find((s) => s.id === id);
    if (target && target.model) {
      setCurrentModel(target.model);
    }
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    if (updated.length === 0) {
      const freshSession: ChatSession = {
        id: generateId(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: currentModel,
      };
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
    } else {
      setSessions(updated);
      if (activeSessionId === id) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  // Clear All Sessions
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all chat history?')) {
      if (isStreaming) handleStopStreaming();
      const freshSession: ChatSession = {
        id: generateId(),
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: currentModel,
      };
      setSessions([freshSession]);
      setActiveSessionId(freshSession.id);
    }
  };

  // Clear current active session messages
  const handleClearCurrentChat = () => {
    if (!activeSessionId) return;
    if (isStreaming) handleStopStreaming();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [], title: 'New Conversation', updatedAt: Date.now() }
          : s
      )
    );
  };

  // Update Session Title
  const handleUpdateTitle = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Toggle Dark/Light Theme
  const handleToggleTheme = () => {
    const newTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    const updatedSettings: UserSettings = { ...settings, theme: newTheme };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);

    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  };

  // Save Settings from Modal
  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    setCurrentModel(newSettings.defaultModel);
  };

  // Stop Streaming Response
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Image Generation Handler
  const handleGenerateImage = async (prompt: string, sessionId: string, newMsgList: Message[]) => {
    setIsStreaming(true);
    const assistantMsgId = generateId();

    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '🎨 Generating AI image with prompt: "' + prompt + '"...',
      createdAt: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...newMsgList, initialAssistantMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedMsgs = s.messages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `Here is your generated image for: **"${prompt}"**`,
                  images: [
                    {
                      url: data.url,
                      title: prompt,
                      isGenerated: true,
                    },
                  ],
                }
              : msg
          );
          return { ...s, messages: updatedMsgs, updatedAt: Date.now() };
        })
      );
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedMsgs = s.messages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: err.message || 'Image generation failed.',
                  isError: true,
                }
              : msg
          );
          return { ...s, messages: updatedMsgs, updatedAt: Date.now() };
        })
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Image Search Handler
  const handleSearchImages = async (query: string, sessionId: string, newMsgList: Message[]) => {
    setIsStreaming(true);
    const assistantMsgId = generateId();

    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '🔍 Searching web images for: "' + query + '"...',
      createdAt: Date.now(),
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...newMsgList, initialAssistantMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    try {
      const res = await fetch('/api/image-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to search images.');
      }

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedMsgs = s.messages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: `Found web images matching: **"${query}"**`,
                  images: data.images,
                }
              : msg
          );
          return { ...s, messages: updatedMsgs, updatedAt: Date.now() };
        })
      );
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedMsgs = s.messages.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content: err.message || 'Image search failed.',
                  isError: true,
                }
              : msg
          );
          return { ...s, messages: updatedMsgs, updatedAt: Date.now() };
        })
      );
    } finally {
      setIsStreaming(false);
    }
  };

  // Core AI Stream Request Handler
  const sendChatRequest = async (targetMessages: Message[], sessionId: string) => {
    setIsStreaming(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const assistantMsgId = generateId();
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      modelUsed: currentModel,
    };

    // Append empty assistant message to session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...targetMessages, initialAssistantMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: targetMessages.map((m) => ({ role: m.role, content: m.content })),
          model: currentModel,
          temperature: settings.temperature,
          systemPrompt: settings.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No readable stream returned from API handler.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update assistant message content in state
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== sessionId) return s;
            const updatedMsgs = s.messages.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
            );
            return { ...s, messages: updatedMsgs, updatedAt: Date.now() };
          })
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user.');
      } else {
        console.error('Chat error:', err);
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== sessionId) return s;
            const updatedMsgs = s.messages.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    content: err.message || 'An error occurred while fetching response.',
                    isError: true,
                  }
                : msg
            );
            return { ...s, messages: updatedMsgs, updatedAt: Date.now() };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Submit User Message
  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming || !activeSessionId) return;

    const userText = input.trim();
    const currentMode = inputMode;
    setInput('');

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: userText,
      createdAt: Date.now(),
    };

    const currentMsgs = activeSession?.messages || [];
    const newMsgList = [...currentMsgs, userMessage];

    // Check if title auto-generation is needed
    let updatedTitle = activeSession.title;
    if (currentMsgs.length === 0 || activeSession.title === 'New Conversation') {
      updatedTitle = generateTitleFromMessage(userText);
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: updatedTitle,
              messages: newMsgList,
              model: currentModel,
              updatedAt: Date.now(),
            }
          : s
      )
    );

    // Intent routing
    const lower = userText.toLowerCase();
    if (
      currentMode === 'GENERATE_IMAGE' ||
      userText.startsWith('/image') ||
      lower.startsWith('generate an image') ||
      lower.startsWith('create an image') ||
      lower.startsWith('generate image')
    ) {
      const cleanPrompt = userText.replace(/^\/image\s*/i, '');
      await handleGenerateImage(cleanPrompt, activeSessionId, newMsgList);
    } else if (
      currentMode === 'SEARCH_IMAGE' ||
      lower.startsWith('search images of') ||
      lower.startsWith('search for images of') ||
      lower.startsWith('show images of')
    ) {
      const query = userText
        .replace(/^search images of\s*/i, '')
        .replace(/^search for images of\s*/i, '')
        .replace(/^show images of\s*/i, '');
      await handleSearchImages(query, activeSessionId, newMsgList);
    } else {
      await sendChatRequest(newMsgList, activeSessionId);
    }
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (isStreaming || !activeSession || !activeSessionId || activeSession.messages.length === 0) return;

    const msgs = [...activeSession.messages];
    // Remove last assistant message if present
    if (msgs[msgs.length - 1].role === 'assistant') {
      msgs.pop();
    }

    if (msgs.length === 0) return;

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: msgs } : s))
    );

    await sendChatRequest(msgs, activeSessionId);
  };

  // Submit Edited User Message
  const handleEditSubmit = async (newContent: string) => {
    if (isStreaming || !activeSession || !activeSessionId) return;

    // Find first message edited index
    const editedMsgIndex = activeSession.messages.findIndex((m) => m.content === newContent);

    let baseMsgs: Message[];
    if (editedMsgIndex !== -1) {
      baseMsgs = activeSession.messages.slice(0, editedMsgIndex + 1);
    } else {
      // Create new list up to last user message edited
      const lastUserIdx = activeSession.messages.map((m) => m.role).lastIndexOf('user');
      if (lastUserIdx !== -1) {
        baseMsgs = [
          ...activeSession.messages.slice(0, lastUserIdx),
          { ...activeSession.messages[lastUserIdx], content: newContent },
        ];
      } else {
        baseMsgs = [{ id: generateId(), role: 'user', content: newContent, createdAt: Date.now() }];
      }
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: baseMsgs } : s))
    );

    await sendChatRequest(baseMsgs, activeSessionId);
  };

  // Export chats JSON file
  const handleExportChats = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `jarvis_ultron_chats_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import chats JSON file
  const handleImportChats = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);
            setActiveSessionId(parsed[0].id);
            alert('Chat history imported successfully!');
          }
        } catch {
          alert('Failed to parse chat history JSON file.');
        }
      };
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#070a11] flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span>Initializing Jarvis Assistant...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#070a11] dark:bg-[#070a11]">
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        theme={settings.theme}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearAll}
        onUpdateTitle={handleUpdateTitle}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCloseMobileSidebar={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header Bar */}
        <Header
          currentModel={currentModel}
          onModelChange={(modelId) => setCurrentModel(modelId)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onClearCurrentChat={handleClearCurrentChat}
          availableModels={availableModels}
        />

        {/* Scrollable Conversation Workspace */}
        <ChatArea
          messages={activeSession?.messages || []}
          isStreaming={isStreaming}
          modelName={currentModel}
          onSelectPromptStarter={(promptText) => {
            setInput(promptText);
          }}
          onRegenerate={handleRegenerate}
          onEditSubmit={handleEditSubmit}
        />

        {/* Floating Input Dock */}
        <ChatInput
          input={input}
          setInput={setInput}
          inputMode={inputMode}
          setInputMode={setInputMode}
          onSend={handleSendMessage}
          onStop={handleStopStreaming}
          isStreaming={isStreaming}
          modelName={currentModel}
        />
      </div>

      {/* Settings Dialog Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onExportChats={handleExportChats}
        onImportChats={handleImportChats}
      />
    </div>
  );
}
