'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Search,
  Palette,
  MessageSquare,
  Mic,
  Volume2,
  VolumeX,
  Camera,
  Wand2
} from 'lucide-react';
import { speechService, createSpeechRecognizer } from '@/utils/speech';

export type InputMode = 'CHAT' | 'SEARCH_IMAGE' | 'GENERATE_IMAGE';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  modelName: string;
  onOpenPhotoStudio: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  inputMode,
  setInputMode,
  onSend,
  onStop,
  isStreaming,
  modelName,
  onOpenPhotoStudio,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [isReadingPrompt, setIsReadingPrompt] = useState(false);

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

  // Toggle Voice Dictation Microphone
  const handleToggleMic = () => {
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setInput(input ? `${input} ${transcript}` : transcript);
        setIsListeningMic(false);
      },
      () => setIsListeningMic(false),
      () => setIsListeningMic(false)
    );

    if (recognizer) {
      setIsListeningMic(true);
      recognizer.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  // Read Prompt Aloud
  const handleReadPrompt = () => {
    if (!input.trim()) return;
    if (isReadingPrompt) {
      speechService.stop();
      setIsReadingPrompt(false);
    } else {
      setIsReadingPrompt(true);
      speechService.readText(input, () => setIsReadingPrompt(false));
    }
  };

  const getPlaceholder = () => {
    if (inputMode === 'SEARCH_IMAGE') return 'Search for web images (e.g. quantum computer, cyberpunk city)...';
    if (inputMode === 'GENERATE_IMAGE') return 'Describe an AI image to generate (e.g. futuristic glowing robot avatar)...';
    return 'Ask Jarvis anything or speak prompt...';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 sm:pb-6">
      <div className="relative rounded-2xl bg-slate-900/90 dark:bg-[#0c121e]/90 border border-slate-700/80 focus-within:border-cyan-500/60 shadow-2xl transition-all duration-200">
        {/* Mode Selector Pill Bar */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1 border-b border-slate-800/40 select-none overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setInputMode('CHAT')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                inputMode === 'CHAT'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>AI Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('SEARCH_IMAGE')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                inputMode === 'SEARCH_IMAGE'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span>Search Images</span>
            </button>

            <button
              type="button"
              onClick={() => setInputMode('GENERATE_IMAGE')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                inputMode === 'GENERATE_IMAGE'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Quick Image</span>
            </button>
          </div>

          {/* Detailed Photo Generator Studio Launcher */}
          <button
            type="button"
            onClick={onOpenPhotoStudio}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600/30 to-purple-600/30 hover:from-cyan-600/50 hover:to-purple-600/50 text-cyan-300 border border-cyan-500/40 transition-all shrink-0"
            title="Open Detailed AI Photo Generator Studio"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Photo Studio</span>
          </button>
        </div>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          rows={1}
          className="w-full pt-3 pb-2 px-4 bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base focus:outline-none resize-none max-h-52 overflow-y-auto font-sans"
        />

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-slate-800/40 select-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> Powered by {modelName.split('/')[1] || modelName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Prompt Reader Speaker Button (read aloud draft prompt) */}
            {input.trim() && (
              <button
                type="button"
                onClick={handleReadPrompt}
                title={isReadingPrompt ? "Stop reading draft prompt" : "Read prompt aloud (Prompt Reader)"}
                className={`p-2 rounded-xl border transition-all ${
                  isReadingPrompt
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-slate-800/80 text-slate-400 hover:text-cyan-300 border-slate-700/60'
                }`}
              >
                {isReadingPrompt ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {/* Voice Dictation Microphone Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              title={isListeningMic ? "Listening... click to stop" : "Speak prompt (Voice Dictation)"}
              className={`p-2 rounded-xl border transition-all ${
                isListeningMic
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse shadow-md shadow-red-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border-slate-700/60'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>

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
                className={`p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg transition-all active:scale-95 ${
                  inputMode === 'GENERATE_IMAGE'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20'
                    : inputMode === 'SEARCH_IMAGE'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 shadow-indigo-500/20'
                    : 'bg-gradient-to-r from-cyan-500 to-indigo-600 shadow-cyan-500/20'
                }`}
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
