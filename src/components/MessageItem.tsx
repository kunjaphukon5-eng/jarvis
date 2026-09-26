'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types/chat';
import { CodeBlock } from './CodeBlock';
import {
  Bot,
  User,
  Copy,
  Check,
  RotateCw,
  Edit2,
  AlertTriangle,
  Sparkles,
  X
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
  onEditSubmit?: (newContent: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isLast,
  isStreaming,
  onRegenerate,
  onEditSubmit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content && onEditSubmit) {
      onEditSubmit(editContent.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group w-full py-5 px-4 sm:px-6 md:px-8 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-slate-900/40 dark:bg-slate-900/50 border-y border-slate-800/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isUser ? (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          ) : (
            <div className="relative group/avatar">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 border border-indigo-400/30 bg-[#0b101c]">
                <img src="/logo.png" alt="Jarvis AI" className="w-full h-full object-cover" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="flex-1 min-w-0">
          {/* Header metadata */}
          <div className="flex items-center justify-between gap-2 mb-1.5 select-none">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200 dark:text-slate-100 flex items-center gap-1.5">
                {isUser ? 'You' : 'Jarvis AI'}
                {!isUser && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Ultron Engine
                  </span>
                )}
              </span>
              {message.modelUsed && !isUser && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
                  • {message.modelUsed}
                </span>
              )}
            </div>

            {/* Message Action Toolbar */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                title="Copy content"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              {isUser && onEditSubmit && !isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditContent(message.content);
                  }}
                  title="Edit prompt"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {!isUser && isLast && !isStreaming && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Edit mode textarea */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-cyan-500/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-3 py-1.5 text-xs rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-medium shadow-md shadow-cyan-500/20"
                >
                  Save & Submit
                </button>
              </div>
            </div>
          ) : (
            /* Main Content Rendering */
            <div className="markdown-content text-slate-300 dark:text-slate-200 text-sm md:text-base leading-relaxed break-words">
              {message.isError ? (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-200 mb-0.5">Response Error</p>
                    <p>{message.content}</p>
                  </div>
                </div>
              ) : isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');

                      if (!inline && (match || codeString.includes('\n'))) {
                        return (
                          <CodeBlock
                            language={match ? match[1] : ''}
                            value={codeString}
                          />
                        );
                      }

                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300 font-mono text-xs md:text-sm border border-slate-700/50"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 underline hover:text-cyan-300 transition-colors"
                        >
                          {children}
                        </a>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-xl border border-slate-700/60">
                          <table className="min-w-full divide-y divide-slate-700/80 text-sm text-left text-slate-300">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return (
                        <thead className="bg-slate-800/80 text-slate-200 font-semibold uppercase text-xs">
                          {children}
                        </thead>
                      );
                    },
                    tbody({ children }) {
                      return (
                        <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                          {children}
                        </tbody>
                      );
                    },
                    th({ children }) {
                      return <th className="px-4 py-2.5">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-4 py-2.5">{children}</td>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-cyan-500/60 pl-4 py-1 italic text-slate-400 my-3 bg-slate-900/30 rounded-r-lg">
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}

              {/* Streaming Indicator Pulsing Cursor */}
              {!isUser && isStreaming && isLast && (
                <span className="inline-block w-2.5 h-4 ml-1 bg-cyan-400 animate-pulse rounded-sm vertical-align-middle" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
