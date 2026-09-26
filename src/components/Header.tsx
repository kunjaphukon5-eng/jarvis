'use client';

import React, { useState } from 'react';
import { ModelOption, DEFAULT_MODELS } from '@/types/chat';
import {
  Menu,
  ChevronDown,
  Sparkles,
  Bot,
  Zap,
  Plus,
  Trash2,
  Check,
  Cpu,
  Search
} from 'lucide-react';

interface HeaderProps {
  currentModel: string;
  onModelChange: (modelId: string) => void;
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onClearCurrentChat: () => void;
  availableModels?: ModelOption[];
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onModelChange,
  onToggleSidebar,
  onNewChat,
  onClearCurrentChat,
  availableModels = DEFAULT_MODELS,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [customModelInput, setCustomModelInput] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const selectedModelObj = availableModels.find((m) => m.id === currentModel) || {
    id: currentModel,
    name: currentModel.split('/')[1] || currentModel,
    provider: currentModel.split('/')[0]?.toUpperCase() || 'OpenRouter',
    description: 'Custom OpenRouter AI model',
  };

  const filteredModels = availableModels.filter(
    (m) =>
      m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.provider.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleCustomModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customModelInput.trim()) {
      onModelChange(customModelInput.trim());
      setIsModelDropdownOpen(false);
      setCustomModelInput('');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#090d16]/80 dark:bg-[#070a10]/80 backdrop-blur-md border-b border-slate-800/80 px-4 flex items-center justify-between gap-4">
      {/* Left side: Sidebar Toggle & App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-slate-200 text-xs sm:text-sm font-medium transition-all shadow-sm group"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">{selectedModelObj.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hidden sm:inline-block">
                {selectedModelObj.provider}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Model Selector Dropdown Modal */}
          {isModelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsModelDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-[#0e1320] border border-slate-700/80 shadow-2xl p-3 space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" /> Select Intelligence Model
                  </span>
                  <span className="text-[10px] text-slate-400">OpenRouter API</span>
                </div>

                {/* Model Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* List of presets */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {filteredModels.map((m) => {
                    const isSelected = m.id === currentModel;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onModelChange(m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start justify-between gap-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/40 text-white'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-100">{m.name}</span>
                            {m.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {m.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Model Input Form */}
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Custom OpenRouter Model ID:</p>
                  <form onSubmit={handleCustomModelSubmit} className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="e.g. mistralai/mistral-large-2411"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={!customModelInput.trim()}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs"
                    >
                      Use
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 transition-colors"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>New Chat</span>
        </button>

        <button
          onClick={onClearCurrentChat}
          title="Clear current messages"
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800/70 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
