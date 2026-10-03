import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Card } from '../../types';

interface CardViewerModalProps {
  card: Card;
  onClose: () => void;
}

export const CardViewerModal: React.FC<CardViewerModalProps> = ({ card, onClose }) => {
  const [iframeError, setIframeError] = useState(false);

  return (
    <div className="cockpit-modal-overlay p-3 sm:p-6">
      <div className="cockpit-modal-panel max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-[var(--border-accent-muted)] flex items-center justify-between bg-[var(--surface-panel-subtle)]">
          <div className="space-y-0.5">
            <h3 className="type-l3 font-semibold text-[var(--text-hero)] flex items-center gap-2">
              <span>{card.title}</span>
              <span className="type-l6 font-mono font-medium text-[var(--text-muted)]">手边入口</span>
            </h3>
            {card.description && (
              <p className="type-l5 text-[var(--text-secondary)] line-clamp-1 font-sans">{card.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cockpit-button cockpit-button--brass-action"
            >
              <span>新标签页打开</span>
              <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
            </a>

            <button
              onClick={onClose}
              className="cockpit-icon-button cockpit-icon-button--neutral"
              aria-label="关闭手边入口"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Iframe or Fallback */}
        <div className="flex-1 bg-[var(--surface-media)] relative flex items-center justify-center p-4">
          {!iframeError ? (
            <iframe
              src={card.url}
              title={card.title}
              onError={() => setIframeError(true)}
              className="w-full h-full border-none rounded bg-white/5"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          ) : (
            <div className="text-center space-y-3 max-w-md p-6 brass-panel rounded-lg">
              <AlertCircle className="w-8 h-8 text-[var(--accent-brass)] mx-auto" />
              <div className="type-l3 font-semibold text-[var(--text-hero)]">该页面不支持内嵌浏览 (Iframe Restricted)</div>
              <p className="type-l5 text-[var(--text-secondary)] leading-relaxed font-sans">
                部分网站出于同源策略禁止在框架中展示，这非常正常。Cockpit
                负责把上下文收拢手边，网页自己管理内容。
              </p>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cockpit-button cockpit-button--brass-action"
              >
                <span>直接前往 {card.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
