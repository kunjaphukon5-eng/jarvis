'use client';

import React, { useState } from 'react';
import { UserSettings, DEFAULT_SETTINGS, DEFAULT_MODELS } from '@/types/chat';
import { X, Sliders, RotateCcw, Download, Upload, Check, Bot } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (newSettings: UserSettings) => void;
  onExportChats: () => void;
  onImportChats: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportChats,
  onImportChats,
}) => {
  const [formState, setFormState] = useState<UserSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setFormState(DEFAULT_SETTINGS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0c111c] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-lg">Jarvis Assistant Settings</h2>
              <p className="text-xs text-slate-400">Configure system instructions & generation parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* System Prompt */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                System Prompt (Persona)
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({ ...prev, systemPrompt: DEFAULT_SETTINGS.systemPrompt }))
                }
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Persona
              </button>
            </div>
            <textarea
              rows={4}
              value={formState.systemPrompt}
              onChange={(e) => setFormState({ ...formState, systemPrompt: e.target.value })}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              placeholder="System prompt instructions for Jarvis..."
            />
          </div>

          {/* Default Model */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Default Model
            </label>
            <select
              value={formState.defaultModel}
              onChange={(e) => setFormState({ ...formState, defaultModel: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            >
              {DEFAULT_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                Creativity / Temperature ({formState.temperature})
              </label>
              <span className="text-[11px] text-slate-400">
                {formState.temperature <= 0.3
                  ? 'Precise & Analytical'
                  : formState.temperature <= 0.7
                  ? 'Balanced'
                  : 'Creative & Diverse'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={formState.temperature}
              onChange={(e) => setFormState({ ...formState, temperature: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Data Backup & Restore */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
              Chat History Backup
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onExportChats}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Chat History (JSON)</span>
              </button>

              <label className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Import Chat History</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportChats}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Reset to Defaults
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
