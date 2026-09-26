'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Square, Sparkles, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  modelName: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  onStop,
  isStreaming,
  modelName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
      <div className="relative rounded-2xl bg-slate-900/90 dark:bg-[#0c121e]/90 border border-slate-700/80 focus-within:border-cyan-500/60 shadow-2xl transition-all duration-200">
        {/* Top Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Jarvis anything..."
          rows={1}
          className="w-full pt-3.5 pb-2 px-4 bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base focus:outline-none resize-none max-h-52 overflow-y-auto font-sans"
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-slate-800/40 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Powered by {modelName.split('/')[1] || modelName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 hidden md:inline-block">
              Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">Shift</kbd> + <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400">Enter</kbd> for new line
            </span>

            {isStreaming ? (
              <button
                onClick={onStop}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-medium text-xs shadow-md shadow-red-600/20 transition-all active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={onSend}
                disabled={!input.trim()}
                type="button"
                className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
