import React from 'react';
import {
  Compass,
  Calendar,
  Layers,
  Clock,
  Inbox,
  ExternalLink,
  Settings,
  Sparkles,
  Command,
  Plus
} from 'lucide-react';
import { Card, Phase } from '../types';

interface NavigationSidebarProps {
  currentView: 'today' | 'tracks' | 'history' | 'inbox';
  onSelectView: (view: 'today' | 'tracks' | 'history' | 'inbox') => void;
  currentPhase?: Phase;
  pinnedCards: Card[];
  onOpenCard: (card: Card) => void;
  onOpenAddCard: () => void;
  onOpenSettings: () => void;
  onOpenAiExport: () => void;
  onOpenCommandPalette: () => void;
  isSessionRunning: boolean;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentView,
  onSelectView,
  currentPhase,
  pinnedCards,
  onOpenCard,
  onOpenAddCard,
  onOpenSettings,
  onOpenAiExport,
  onOpenCommandPalette,
  isSessionRunning,
}) => {
  return (
    <aside className="w-[240px] h-screen bg-[#0c0b0a] border-r border-[#c69956]/15 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-3.5 border-b border-[#c69956]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-[#221b13] border border-[#c69956]/35 flex items-center justify-center text-[#dfbf85] shadow-inner relative shrink-0">
              <Compass className="w-3.5 h-3.5 animate-[spin_60s_linear_infinite]" />
              <span className="absolute -top-0.5 -right-0.5 rivet" />
            </div>
            <div className="min-w-0">
              <div className="font-brand text-[13px] leading-tight tracking-wider font-bold text-[var(--text-hero)] uppercase whitespace-nowrap flex items-center gap-1.5">
                <span>Gap Cockpit</span>
                <span className="text-[10px] text-[#b98a4a] font-mono tracking-normal font-normal">v0</span>
              </div>
              <div className="type-l6 text-[var(--text-muted)] truncate max-w-[125px] font-sans" title={currentPhase?.name}>
                {currentPhase?.name || 'Local Pilot'}
              </div>
            </div>
          </div>
          {isSessionRunning && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(107,135,124,0.15)] border border-[rgba(107,135,124,0.35)] text-[#86a69a] text-[10px] font-mono font-medium animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#86a69a]" />
              LIVE
            </div>
          )}
        </div>

        {/* Primary Views */}
        <div className="px-3 py-4 space-y-1">
          <button
            onClick={() => onSelectView('today')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md type-l5 font-medium transition-all ${
              currentView === 'today'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/35 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className={`w-4 h-4 ${currentView === 'today' ? 'text-[#d4ab6a]' : 'text-[#5a5043]'}`} />
              <span>今天</span>
            </div>
            {isSessionRunning ? (
              <span className="w-2 h-2 rounded-full bg-[#86a69a]" />
            ) : (
              <span className={`type-l6 font-mono tracking-wider ${currentView === 'today' ? 'text-[var(--text-muted)]' : 'text-[var(--text-ghost)]'}`}>01</span>
            )}
          </button>

          <button
            onClick={() => onSelectView('tracks')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md type-l5 font-medium transition-all ${
              currentView === 'tracks'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/35 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className={`w-4 h-4 ${currentView === 'tracks' ? 'text-[#d4ab6a]' : 'text-[#5a5043]'}`} />
              <span>主线脉络</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider ${currentView === 'tracks' ? 'text-[var(--text-muted)]' : 'text-[var(--text-ghost)]'}`}>02</span>
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md type-l5 font-medium transition-all ${
              currentView === 'history'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/35 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 ${currentView === 'history' ? 'text-[#d4ab6a]' : 'text-[#5a5043]'}`} />
              <span>历史轨迹</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider ${currentView === 'history' ? 'text-[var(--text-muted)]' : 'text-[var(--text-ghost)]'}`}>03</span>
          </button>

          <button
            onClick={() => onSelectView('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md type-l5 font-medium transition-all ${
              currentView === 'inbox'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/35 shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className={`w-4 h-4 ${currentView === 'inbox' ? 'text-[#d4ab6a]' : 'text-[#5a5043]'}`} />
              <span>收集箱</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider ${currentView === 'inbox' ? 'text-[var(--text-muted)]' : 'text-[var(--text-ghost)]'}`}>04</span>
          </button>
        </div>

        {/* Hairline Divider with single subtle center accent */}
        <div className="px-3 my-2 flex items-center gap-2">
          <div className="h-[1px] bg-[#c69956]/15 flex-1" />
          <span className="w-1 h-1 rounded-full bg-[#c69956]/30" />
          <div className="h-[1px] bg-[#c69956]/15 flex-1" />
        </div>

        {/* Pinned Cards Section (Quiet secondary registry) */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between px-3 mb-2 type-l6 font-mono uppercase tracking-widest text-[var(--text-ghost)]">
            <span>CARDS · 手边入口</span>
            <button
              onClick={onOpenAddCard}
              className="text-[var(--text-ghost)] hover:text-[#dfbf85] transition-colors p-0.5 rounded cursor-pointer"
              title="添加快捷入口"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {pinnedCards.map(card => (
              <button
                key={card.id}
                onClick={() => onOpenCard(card)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310] transition-colors group text-left cursor-pointer"
              >
                <span className="truncate">{card.title}</span>
                <ExternalLink className="w-3 h-3 text-[var(--text-ghost)] group-hover:text-[#dfbf85] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls (Quiet instrument utilities) */}
      <div className="p-3 border-t border-[#c69956]/12 space-y-1">
        <button
          onClick={onOpenAiExport}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded type-l5 text-[#b98a4a] hover:bg-[#1c1711] hover:text-[#dfbf85] transition-colors cursor-pointer"
          title="生成当前阶段与主线的完整 Markdown Context 供粘贴至 Claude / ChatGPT"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#b98a4a]" />
          <span>Copy AI Context</span>
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5" />
            <span>快捷指令</span>
          </div>
          <kbd className="px-1.5 py-0.5 type-l6 bg-[#13110e] border border-[#2b241c] rounded text-[var(--text-ghost)]">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#151310] transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>驾驶舱设置</span>
        </button>
      </div>
    </aside>
  );
};
