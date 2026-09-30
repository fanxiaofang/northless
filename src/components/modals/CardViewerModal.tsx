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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="brass-panel-elevated rounded-lg max-w-4xl w-full h-[85vh] flex flex-col border border-[#c69956]/40 shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#c69956]/20 flex items-center justify-between bg-[#161411]">
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-base text-[#f7f2ea] flex items-center gap-2">
              <span>{card.title}</span>
              <span className="text-xs font-mono font-normal text-[#c69956]">Handy Portal</span>
            </h3>
            {card.description && (
              <p className="text-xs text-[#9c9183] line-clamp-1">{card.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              className="brass-button px-3 py-1.5 rounded text-xs text-[#fcf9f2] flex items-center gap-1.5"
            >
              <span>新标签页打开</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#dfbf85]" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8a7f72] hover:text-[#f4efe8] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Iframe or Fallback */}
        <div className="flex-1 bg-[#100f0e] relative flex items-center justify-center p-4">
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
              <AlertCircle className="w-8 h-8 text-[#c69956] mx-auto" />
              <div className="text-sm font-semibold text-[#f7f2ea]">该页面不支持内嵌浏览 (Iframe Restricted)</div>
              <p className="text-xs text-[#9c9183]">
                部分网站出于同源策略禁止在框架中展示，这非常正常。Cockpit
                负责把上下文收拢手边，网页自己管理内容。
              </p>
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="brass-button px-4 py-2 rounded text-xs font-semibold text-[#fcf9f2] inline-flex items-center gap-2"
              >
                <span>直接前往 {card.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#dfbf85]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
