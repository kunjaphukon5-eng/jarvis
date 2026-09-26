'use client';

import React, { useState } from 'react';
import { ChatSession } from '@/types/chat';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  Settings,
  Sun,
  Moon,
  Search,
  Bot,
  Zap,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  theme: 'dark' | 'light';
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAll: () => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onCloseMobileSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  isOpen,
  theme,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAll,
  onUpdateTitle,
  onToggleTheme,
  onOpenSettings,
  onCloseMobileSidebar,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  });

  const handleStartRename = (e: React.MouseEvent, s: ChatSession) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditingTitle(s.title);
  };

  const handleSaveRename = (e: React.MouseEvent | React.FormEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingTitle.trim()) {
      onUpdateTitle(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobileSidebar}
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#090d16] dark:bg-[#070a10] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* App Logo & Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <img src="/logo.png" alt="Jarvis AI Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                  JARVIS
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Ultron
                </span>
              </div>
              <p className="text-[11px] text-slate-400">OpenRouter AI Assistant</p>
            </div>
          </div>

          <button
            onClick={onCloseMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Action */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobileSidebar();
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-blue-600 hover:from-cyan-500 hover:via-indigo-500 hover:to-blue-500 text-white font-medium shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all duration-200 group active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search Bar */}
        {sessions.length > 0 && (
          <div className="px-3 py-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-10 px-4 text-slate-500 text-xs">
              {searchQuery ? (
                'No conversations found matching your search.'
              ) : (
                <div className="space-y-2">
                  <Sparkles className="w-8 h-8 text-slate-600 mx-auto opacity-40" />
                  <p>No chats yet.</p>
                  <p className="text-[11px] text-slate-600">Start a new chat to trigger Jarvis!</p>
                </div>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isRenaming = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobileSidebar();
                  }}
                  className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800/90 text-slate-100 font-medium border border-cyan-500/30 shadow-md shadow-cyan-950/40'
                      : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />

                  {isRenaming ? (
                    <form
                      onSubmit={(e) => handleSaveRename(e, session.id)}
                      className="flex-1 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        autoFocus
                        className="w-full bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-400 hover:text-emerald-300"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <span className="flex-1 truncate leading-tight">
                      {session.title || 'Untitled Chat'}
                    </span>
                  )}

                  {!isRenaming && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleStartRename(e, session)}
                        title="Rename chat"
                        className="p-1 hover:text-slate-200 text-slate-500 rounded"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        title="Delete chat"
                        className="p-1 hover:text-red-400 text-slate-500 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-slate-950/40">
          {sessions.length > 0 && (
            <button
              onClick={onClearAll}
              className="w-full px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-slate-900/60 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-500" />
              <span>Clear all chats</span>
            </button>
          )}

          <div className="flex items-center gap-1 pt-1">
            <button
              onClick={onToggleTheme}
              className="flex-1 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 rounded-xl flex items-center justify-center gap-2 border border-slate-800/60 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenSettings}
              title="Settings & System Prompt"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl border border-slate-800/60 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
