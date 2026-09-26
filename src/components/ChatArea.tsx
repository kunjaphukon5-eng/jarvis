'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Message } from '@/types/chat';
import { MessageItem } from './MessageItem';
import {
  Bot,
  Sparkles,
  ArrowDown,
  Code2,
  BrainCircuit,
  Zap,
  Terminal,
  Compass,
  FileCode2
} from 'lucide-react';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  modelName: string;
  onSelectPromptStarter: (prompt: string) => void;
  onRegenerate: () => void;
  onEditSubmit: (newContent: string) => void;
}

const PROMPT_STARTERS = [
  {
    title: 'Code Generation',
    desc: 'Write a Python web scraper using BeautifulSoup & Asyncio',
    icon: Code2,
    gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
    prompt: 'Write a clean, production-ready Python web scraper using asyncio and BeautifulSoup. Include error handling and commentary.',
  },
  {
    title: 'Architectural Analysis',
    desc: 'Design a high-scale microservice caching strategy using Redis',
    icon: BrainCircuit,
    gradient: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300',
    prompt: 'Explain how to design a resilient distributed caching layer using Redis for high-concurrency Node.js microservices.',
  },
  {
    title: 'Full-Stack Next.js',
    desc: 'Create a Next.js Server Component with streaming SSR',
    icon: FileCode2,
    gradient: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30 text-sky-300',
    prompt: 'Demonstrate a modern Next.js App Router Server Component with React Suspense and streaming data fetching.',
  },
  {
    title: 'Technical Explanations',
    desc: 'Explain Quantum Computing algorithms intuitively',
    icon: Compass,
    gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    prompt: 'Explain quantum superposition and entanglement in simple terms with real-world analogies.',
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isStreaming,
  modelName,
  onSelectPromptStarter,
  onRegenerate,
  onEditSubmit,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto scroll logic
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isStreaming ? 'auto' : 'smooth');
  }, [messages, isStreaming]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
    >
      {messages.length === 0 ? (
        /* Welcome / Zero State View */
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
          {/* Hero Avatar Emblem */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 opacity-60 blur-lg group-hover:opacity-100 transition duration-500"></div>
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-[#0b101c] border border-cyan-400/40 flex items-center justify-center shadow-2xl text-cyan-400">
              <Bot className="w-10 h-10 md:w-12 md:h-12 text-cyan-300 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2 max-w-xl">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              Greetings. I am{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-400 bg-clip-text text-transparent">
                Jarvis
              </span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              Powered by <span className="text-cyan-300 font-semibold">Ultron Intelligence</span> & OpenRouter. How can I assist your workflow today?
            </p>
          </div>

          {/* Prompt Starters Grid */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 text-left">
            {PROMPT_STARTERS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPromptStarter(item.prompt)}
                  className={`p-4 rounded-2xl bg-slate-900/60 dark:bg-[#0c121e]/80 border ${item.gradient} hover:bg-slate-800/80 transition-all duration-200 group shadow-lg flex flex-col justify-between gap-3 text-left`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs tracking-wider uppercase opacity-90">
                      {item.title}
                    </span>
                    <Icon className="w-4 h-4 opacity-70 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 group-hover:text-white leading-snug">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Messages List */
        <div className="pb-8">
          {messages.map((msg, idx) => (
            <MessageItem
              key={msg.id || idx}
              message={msg}
              isLast={idx === messages.length - 1}
              isStreaming={isStreaming}
              onRegenerate={onRegenerate}
              onEditSubmit={onEditSubmit}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="fixed bottom-24 right-6 z-30 p-2.5 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-xl backdrop-blur border border-cyan-400/40 transition-all duration-200 animate-bounce"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
