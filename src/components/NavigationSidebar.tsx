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
    <aside className="w-[220px] h-screen bg-[#11100f] border-r border-[#c69956]/10 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-3 border-b border-[#c69956]/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6.5 h-6.5 rounded-md bg-[#1d1813] border border-[#c69956]/20 flex items-center justify-center text-[#dfbf85] relative shrink-0">
              <Compass className="w-3.5 h-3.5 animate-[spin_60s_linear_infinite]" />
              <span className="absolute -top-0.5 -right-0.5 rivet" />
            </div>
            <div className="min-w-0">
              <div className="font-brand text-[13px] leading-tight tracking-wider font-semibold text-[var(--text-hero)] uppercase whitespace-nowrap flex items-center gap-1.5">
                <span>Gap Cockpit</span>
                <span className="text-[10px] text-[#b98a4a] font-mono tracking-normal font-normal">v0</span>
              </div>
              <div className="type-l6 text-[var(--text-muted)] truncate max-w-[115px] font-sans" title={currentPhase?.name}>
                {currentPhase?.name || 'Local Pilot'}
              </div>
            </div>
          </div>
          {isSessionRunning && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(107,135,124,0.12)] border border-[rgba(107,135,124,0.25)] text-[#86a69a] text-[10px] font-mono font-medium animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#86a69a]" />
              LIVE
            </div>
          )}
        </div>

        {/* Primary Views */}
        <div className="px-2.5 py-3 space-y-0.5">
          <button
            onClick={() => onSelectView('today')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'today'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/25 shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className={`w-3.5 h-3.5 ${currentView === 'today' ? 'text-[#d4ab6a]' : 'text-[#4d4439]'}`} />
              <span>今天</span>
            </div>
            {isSessionRunning ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#86a69a]" />
            ) : (
              <span className={`type-l6 font-mono tracking-wider ${currentView === 'today' ? 'text-[#a8824a]' : 'text-[var(--text-ghost)]'}`}>01</span>
            )}
          </button>

          <button
            onClick={() => onSelectView('tracks')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'tracks'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/25 shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className={`w-3.5 h-3.5 ${currentView === 'tracks' ? 'text-[#d4ab6a]' : 'text-[#4d4439]'}`} />
              <span>主线脉络</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider ${currentView === 'tracks' ? 'text-[#a8824a]' : 'text-[var(--text-ghost)]'}`}>02</span>
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/25 shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className={`w-3.5 h-3.5 ${currentView === 'history' ? 'text-[#d4ab6a]' : 'text-[#4d4439]'}`} />
              <span>历史轨迹</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider ${currentView === 'history' ? 'text-[#a8824a]' : 'text-[var(--text-ghost)]'}`}>03</span>
          </button>

          <button
            onClick={() => onSelectView('inbox')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'inbox'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#c69956]/25 shadow-2xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className={`w-3.5 h-3.5 ${currentView === 'inbox' ? 'text-[#d4ab6a]' : 'text-[#4d4439]'}`} />
              <span>收集箱</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider ${currentView === 'inbox' ? 'text-[#a8824a]' : 'text-[var(--text-ghost)]'}`}>04</span>
          </button>
        </div>

        {/* Hairline Divider with single subtle center accent */}
        <div className="px-2.5 my-1.5 flex items-center gap-2">
          <div className="h-[1px] bg-[#c69956]/10 flex-1" />
          <span className="w-0.5 h-0.5 rounded-full bg-[#c69956]/20" />
          <div className="h-[1px] bg-[#c69956]/10 flex-1" />
        </div>

        {/* Pinned Cards Section */}
        <div className="px-2.5 py-1.5">
          <div className="flex items-center justify-between px-2.5 mb-1.5 type-l6 font-mono uppercase tracking-widest text-[var(--text-ghost)]">
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
                className="w-full flex items-center justify-between px-2.5 py-1 rounded type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412] transition-colors group text-left cursor-pointer"
              >
                <span className="truncate">{card.title}</span>
                <ExternalLink className="w-3 h-3 text-[var(--text-ghost)] group-hover:text-[#dfbf85] transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-2.5 border-t border-[#c69956]/10 space-y-0.5">
        <button
          onClick={onOpenAiExport}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded type-l5 text-[#b98a4a] hover:bg-[#1a1713] hover:text-[#dfbf85] transition-colors cursor-pointer"
          title="生成当前阶段与主线的完整 Markdown Context 供粘贴至 Claude / ChatGPT"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#b98a4a]" />
          <span>Copy AI Context</span>
        </button>

        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Command className="w-3.5 h-3.5" />
            <span>快捷指令</span>
          </div>
          <kbd className="px-1.5 py-0.5 type-l6 bg-[#151310] border border-[#262018] rounded text-[var(--text-ghost)] font-mono">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[#161412] transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>驾驶舱设置</span>
        </button>
      </div>
    </aside>
  );
};
