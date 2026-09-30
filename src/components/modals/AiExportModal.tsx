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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="brass-panel-elevated p-6 rounded-lg max-w-2xl w-full h-[80vh] flex flex-col border border-[#c69956]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1 pb-3 border-b border-[#c69956]/20">
          <div className="flex items-center gap-2 text-xs font-mono text-[#c69956]">
            <Sparkles className="w-3.5 h-3.5 text-[#dfbf85]" />
            <span>AI CONTEXT PROMPT GENERATOR</span>
          </div>
          <h3 className="font-display text-lg font-semibold text-[var(--text-hero)]">
            复制驾驶舱当前上下文
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            直接粘贴给 ChatGPT / Claude / Gemini，让外部大模型协助复盘并建议下一步，无需在应用中配置 API Key。
          </p>
        </div>

        {/* Text Area */}
        <div className="flex-1 py-4 overflow-hidden flex flex-col">
          <textarea
            readOnly
            value={content}
            className="w-full flex-1 bg-[#100f0e] border border-[#c69956]/20 rounded p-4 font-mono text-xs text-[var(--text-primary)] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#c69956]/15">
          <div className="text-xs text-[var(--text-muted)]">
            {copied ? (
              <span className="text-[#dfbf85] flex items-center gap-1.5 font-medium">
                <Check className="w-4 h-4" /> 已成功复制到剪贴板！可以直接粘贴。
              </span>
            ) : (
              <span>包含当前阶段、主线状态、活跃 Next 与最近 7 天日志</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              关闭
            </button>
            <button
              onClick={handleCopy}
              className="brass-button px-5 py-2 text-xs font-semibold text-[var(--text-hero)] rounded flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-[#dfbf85]" /> : <Copy className="w-4 h-4 text-[#dfbf85]" />}
              <span>{copied ? '已复制' : '复制 AI Prompt (Copy Markdown)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
