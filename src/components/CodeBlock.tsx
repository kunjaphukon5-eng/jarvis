'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleDownload = () => {
    const ext = getExtension(language);
    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code_snippet.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getExtension = (lang: string) => {
    const map: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      markdown: 'md',
      bash: 'sh',
      shell: 'sh',
      sql: 'sql',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
      rust: 'rs',
      go: 'go',
    };
    return map[lang.toLowerCase()] || 'txt';
  };

  return (
    <div className="code-block-container my-4 rounded-xl overflow-hidden border border-slate-700/60 bg-[#0d1117] shadow-xl text-sm font-mono">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" />
          <span className="text-xs uppercase font-semibold text-slate-300 tracking-wider">
            {language || 'code'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            title="Download Code File"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto text-xs sm:text-sm">
        <SyntaxHighlighter
          language={language || 'text'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1.25rem 1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: { fontFamily: 'var(--font-mono, monospace)' },
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
