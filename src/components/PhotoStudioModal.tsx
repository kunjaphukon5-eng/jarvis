'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Wand2,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Image as ImageIcon,
  Send,
  Camera,
  Layers,
  Ratio,
  Maximize2
} from 'lucide-react';
import { speechService, createSpeechRecognizer } from '@/utils/speech';

interface PhotoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat: (prompt: string, imageUrl: string) => void;
}

const STYLE_OPTIONS = [
  { id: 'photorealistic', name: 'Photorealistic 8K', icon: '📸', desc: 'Ultra-realistic 35mm camera, natural skin & light' },
  { id: 'cinematic', name: 'Cinematic Movie', icon: '🎬', desc: 'Dramatic lighting, anamorphic lens, IMAX frame' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '🌆', desc: 'Dark neon cities, holographic glows, rain reflections' },
  { id: 'anime', name: 'Modern Anime', icon: '🎨', desc: 'High-budget Makoto Shinkai style, vibrant colors' },
  { id: 'fantasy', name: 'Epic Fantasy', icon: '🐉', desc: 'Mythical atmosphere, ethereal mist, magical details' },
  { id: 'unreal', name: 'Unreal Engine 5', icon: '🎮', desc: 'Octane 3D raytracing, hyper-detailed render' },
  { id: 'portrait', name: 'Studio Portrait', icon: '👤', desc: 'Professional softbox studio lighting, sharp facial bokeh' },
  { id: 'vintage', name: 'Vintage 35mm', icon: '🎞️', desc: 'Analog film grain, nostalgic Kodak Portra tones' },
];

const ASPECT_OPTIONS = [
  { id: '1:1', label: '1:1 Square', dimensions: '1024 x 1024', desc: 'Social & Profile' },
  { id: '16:9', label: '16:9 Cinema', dimensions: '1280 x 720', desc: 'Widescreen & Desktop' },
  { id: '9:16', label: '9:16 Portrait', dimensions: '720 x 1280', desc: 'Mobile & Stories' },
  { id: '4:3', label: '4:3 Classic', dimensions: '1024 x 768', desc: 'Standard Photo' },
];

const LIGHTING_OPTIONS = [
  { id: 'studio', label: 'Studio Softbox' },
  { id: 'volumetric', label: 'Volumetric God Rays' },
  { id: 'golden_hour', label: 'Golden Hour Sunset' },
  { id: 'neon', label: 'Vibrant Neon Rim' },
  { id: 'natural', label: 'Natural Diffuse' },
];

const PROMPT_INSPIRATIONS = [
  'Hyperrealistic close-up portrait of an astronaut looking at glowing Earth reflections on visor',
  'Futuristic supercar speeding through rainy neo-Tokyo street with cyan and purple neon reflections',
  'Ancient mythical library inside a towering bioluminescent crystal cavern with floating scrolls',
  'A cute mechanical robotic owl with luminous amber eyes perched on a brass clockwork branch',
  'Cinematic shot of a lone warrior standing at the edge of a colossal floating sky island at sunset',
];

export const PhotoStudioModal: React.FC<PhotoStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToChat,
}) => {
  const [prompt, setPrompt] = useState('A sleek futuristic cybernetic panther stalking across glowing neon glass rooftops in rain, 8k');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, extra limbs, bad anatomy, deformed');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [selectedAspect, setSelectedAspect] = useState('1:1');
  const [selectedLighting, setSelectedLighting] = useState('neon');
  const [seed, setSeed] = useState(Math.floor(Math.random() * 99999999));
  const [engine, setEngine] = useState<'flux' | 'turbo'>('flux');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isReadingPrompt, setIsReadingPrompt] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [currentResultUrl, setCurrentResultUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gallery, setGallery] = useState<Array<{ url: string; prompt: string; style: string }>>([]);

  if (!isOpen) return null;

  // Prompt Reader (Text-to-Speech)
  const handleReadPrompt = () => {
    if (isReadingPrompt) {
      speechService.stop();
      setIsReadingPrompt(false);
    } else {
      setIsReadingPrompt(true);
      speechService.readText(prompt, () => setIsReadingPrompt(false));
    }
  };

  // Voice Input (Speech-to-Text)
  const handleToggleMic = () => {
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (transcript) => {
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
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

  // AI Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);

    try {
      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: selectedStyle }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Enhancement failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Generate Photo
  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          aspectRatio: selectedAspect,
          lighting: selectedLighting,
          negativePrompt,
          seed,
          engine,
        }),
      });

      const data = await res.json();
      if (data.url) {
        setCurrentResultUrl(data.url);
        setGallery((prev) => [{ url: data.url, prompt, style: selectedStyle }, ...prev.slice(0, 9)]);
      } else {
        alert(data.error || 'Photo generation failed.');
      }
    } catch (err) {
      alert('Network error while generating photo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis_photo_${Date.now()}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSurpriseMe = () => {
    const random = PROMPT_INSPIRATIONS[Math.floor(Math.random() * PROMPT_INSPIRATIONS.length)];
    setPrompt(random);
    setSeed(Math.floor(Math.random() * 99999999));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-6xl h-[92vh] rounded-3xl bg-[#0a0f1d] border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-100 text-base sm:text-lg tracking-wide">
                  AI Photo Generator Engine
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  FLUX.1 Neural Studio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Detailed multi-engine photo synthesis with integrated Prompt Reader & Enhancer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Workspace Body */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Column: Controls & Prompt Reader */}
          <div className="w-full lg:w-1/2 p-5 overflow-y-auto space-y-5 border-r border-slate-800/80 scrollbar-thin">
            {/* Prompt Input Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Image Prompt
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSurpriseMe}
                    className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    🎲 Surprise Me
                  </button>
                  <span className="text-slate-600">•</span>
                  {/* Read Prompt Aloud Button */}
                  <button
                    type="button"
                    onClick={handleReadPrompt}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                      isReadingPrompt
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                    }`}
                    title="Read prompt aloud using speech engine"
                  >
                    {isReadingPrompt ? (
                      <>
                        <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-cyan-400" />
                        <span>Read Prompt</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 pr-20 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Describe the photo you want to create in vivid detail..."
                />

                {/* Inside-Textarea Quick Actions */}
                <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
                  {/* Voice Dictate Mic Button */}
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-1.5 rounded-lg border transition-all ${
                      isListeningMic
                        ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                    }`}
                    title="Speak prompt with microphone"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Enhance Prompt Button */}
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                    title="Enhance prompt with AI"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Enhance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 text-xs uppercase tracking-wider">
                Negative Prompt (Avoid in photo)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-700"
                placeholder="What to exclude (e.g. blurry, grain, distorted)..."
              />
            </div>

            {/* Style Presets Grid */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" /> Photographic Style Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      selectedStyle === style.id
                        ? 'bg-gradient-to-b from-cyan-950/60 to-indigo-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-base mb-1">{style.icon}</div>
                    <div className="font-bold text-xs truncate">{style.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio & Lighting Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Aspect Ratio */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Ratio className="w-4 h-4 text-cyan-400" /> Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_OPTIONS.map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setSelectedAspect(ratio.id)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        selectedAspect === ratio.id
                          ? 'bg-cyan-950/60 border-cyan-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="font-bold text-xs">{ratio.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ratio.dimensions}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting Mood */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Lighting & Atmosphere
                </label>
                <select
                  value={selectedLighting}
                  onChange={(e) => setSelectedLighting(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  {LIGHTING_OPTIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>

                {/* Seed and Engine */}
                <div className="pt-2 flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono focus:outline-none"
                      title="Seed number"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSeed(Math.floor(Math.random() * 99999999))}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    title="Randomize seed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering Neural Photo...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    <span>Synthesize High-Res Photo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: High-Res Photo Render & Studio Gallery */}
          <div className="w-full lg:w-1/2 p-5 flex flex-col justify-between bg-slate-950/40">
            {/* Main Active Canvas */}
            <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#070a14] p-4 relative overflow-hidden group">
              {isGenerating ? (
                <div className="text-center space-y-3">
                  <div className="relative w-16 h-16 mx-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40"></span>
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                      <Camera className="w-8 h-8 animate-pulse" />
                    </div>
                  </div>
                  <p className="font-bold text-slate-200 text-sm">Synthesizing Neural Photograph...</p>
                  <p className="text-xs text-slate-500">FLUX diffusion engine rendering 8K passes</p>
                </div>
              ) : currentResultUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={currentResultUrl}
                    alt="AI Generated Photo"
                    className="max-h-[50vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
                  />
                  {/* Floating Action Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(currentResultUrl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" /> Download HD
                    </button>

                    <button
                      onClick={() => handleCopyUrl(currentResultUrl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onInsertToChat(prompt, currentResultUrl);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" /> Send to Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 text-slate-500 max-w-xs">
                  <ImageIcon className="w-12 h-12 mx-auto opacity-30 text-cyan-400" />
                  <p className="text-xs">
                    Configure your prompt & style on the left, then click <strong>Synthesize High-Res Photo</strong> to generate.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Gallery Strip */}
            {gallery.length > 0 && (
              <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider">Session Gallery ({gallery.length})</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {gallery.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentResultUrl(item.url)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border transition-transform hover:scale-105 ${
                        currentResultUrl === item.url ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-slate-800'
                      }`}
                    >
                      <img src={item.url} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
