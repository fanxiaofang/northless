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
      <div className="cockpit-modal-panel p-6 max-w-2xl w-full h-[80vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="cockpit-icon-button cockpit-icon-button--neutral absolute top-4 right-4"
          aria-label="关闭上下文导出"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pb-3 border-b border-[#b8894f]/20">
          <div className="flex items-center gap-2 type-l6 font-mono font-medium text-[#b8894f]">
            <Sparkles className="w-3.5 h-3.5 text-[#b8894f]" />
            <span>CONTEXT EXPORT / 驾驶舱上下文</span>
          </div>
          <h3 className="type-l3 font-semibold text-[var(--text-hero)]">
            复制当前驾驶舱上下文
          </h3>
          <p className="type-l5 text-[var(--text-secondary)] font-sans">
            将当前阶段、主线状态、活跃 Next 与最近 7 天记录整理为 Markdown。可直接粘贴到 ChatGPT、Claude、Gemini，也可以保存到其他笔记或工具中。
          </p>
        </div>

        {/* Text Area */}
        <div className="flex-1 py-4 overflow-hidden flex flex-col">
          <textarea
            readOnly
            value={content}
            className="w-full flex-1 bg-[#100f0e] border border-[#b8894f]/20 rounded p-4 font-mono type-l5 text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed font-medium"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#b8894f]/15">
          <div className="type-l5 text-[var(--text-muted)] font-mono">
            {copied ? (
              <span className="text-[#b8894f] flex items-center gap-1.5 font-medium font-sans">
                <Check className="w-4 h-4" /> 已复制到剪贴板
              </span>
            ) : (
              <span>包含当前阶段、主线状态、活跃 Next 与最近 7 天记录</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
            >
              关闭
            </button>
            <button
              onClick={handleCopy}
              className="cockpit-button cockpit-button--primary"
            >
              {copied ? <Check className="w-4 h-4 text-[#b8894f]" /> : <Copy className="w-4 h-4 text-[#b8894f]" />}
              <span>{copied ? '已复制到剪贴板' : '复制 Markdown 上下文'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
