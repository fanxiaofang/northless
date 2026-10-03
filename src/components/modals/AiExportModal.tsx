import React, { useState } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';

interface AiExportModalProps {
  content: string;
  onClose: () => void;
}

export const AiExportModal: React.FC<AiExportModalProps> = ({ content, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="cockpit-modal-overlay">
      <div className="cockpit-modal-panel p-6 max-w-2xl w-full h-[80vh] flex flex-col relative" role="dialog" aria-modal="true" aria-labelledby="context-export-title">
        <button
          onClick={onClose}
          className="cockpit-icon-button cockpit-icon-button--neutral absolute top-4 right-4"
          aria-label="关闭上下文导出"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pb-3 border-b border-[var(--border-accent-muted)]">
          <div className="flex items-center gap-2 type-l6 font-mono font-medium text-[var(--accent-brass)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
            <span>CONTEXT EXPORT / 当前上下文</span>
          </div>
          <h3 id="context-export-title" className="type-l3 font-semibold text-[var(--text-hero)]">
            复制当前上下文
          </h3>
          <p className="type-l5 text-[var(--text-secondary)] font-sans">
            将主线状态、活跃 Next 与最近 7 天记录整理为 Markdown。可直接粘贴到 ChatGPT、Claude、Gemini，也可以保存到笔记或其他工具。
          </p>
        </div>

        {/* Text Area */}
        <div className="flex-1 py-4 overflow-hidden flex flex-col">
          <textarea
            readOnly
            value={content}
            className="form-slot w-full flex-1 p-4 font-mono type-l5 resize-none leading-relaxed font-medium"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border-accent-subtle)]">
          <div className="type-l5 text-[var(--text-muted)] font-mono">
            {copied ? (
              <span className="text-[var(--accent-brass)] flex items-center gap-1.5 font-medium font-sans">
                <Check className="w-4 h-4" /> 已复制
              </span>
            ) : (
              <span>包含当前主线状态、活跃 Next 与最近 7 天记录</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="cockpit-button cockpit-button--secondary"
            >
              关闭
            </button>
            <button
              onClick={handleCopy}
              className="cockpit-button cockpit-button--primary"
            >
              {copied ? <Check className="w-4 h-4 text-[var(--accent-brass)]" /> : <Copy className="w-4 h-4 text-[var(--accent-brass)]" />}
              <span>{copied ? '已复制' : '复制 Markdown'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
