import React from 'react';
import {
  Compass,
  Calendar,
  Layers,
  Clock,
  Inbox,
  Settings,
  Sparkles,
  Plus
} from 'lucide-react';
import { Card, Phase } from '../types';
import { CockpitTooltip } from './ui/CockpitTooltip';

interface NavigationSidebarProps {
  currentView: 'today' | 'tracks' | 'history' | 'inbox';
  onSelectView: (view: 'today' | 'tracks' | 'history' | 'inbox') => void;
  currentPhase?: Phase;
  pinnedCards: Card[];
  onOpenCard: (card: Card) => void;
  onOpenAddCard: () => void;
  onOpenSettings: () => void;
  onOpenAiExport: () => void;
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
  isSessionRunning,
}) => {
  return (
    <aside className="w-[220px] h-screen bg-[#11100f] border-r border-[#b8894f]/15 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-3 border-b border-[#b8894f]/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6.5 h-6.5 rounded-md bg-[#1d1813] border border-[#b8894f]/25 flex items-center justify-center text-[#c89a5a] relative shrink-0">
              <Compass className="w-3.5 h-3.5 animate-[spin_60s_linear_infinite]" />
              <span className="absolute -top-0.5 -right-0.5 rivet" />
            </div>
            <div className="min-w-0">
              <div className="font-brand text-[13px] leading-tight tracking-wider font-semibold text-[var(--text-hero)] uppercase whitespace-nowrap flex items-center gap-1.5">
                <span>Gap Cockpit</span>
                <span className="text-[10px] text-[#b8894f] font-mono tracking-normal font-medium">v0</span>
              </div>
              <CockpitTooltip content={currentPhase?.name || 'Local Pilot'}><div className="type-l6 text-[var(--text-muted)] truncate max-w-[115px] font-sans font-medium">
                {currentPhase?.name || 'Local Pilot'}
              </div></CockpitTooltip>
            </div>
          </div>
          {isSessionRunning && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[rgba(120,153,141,0.14)] border border-[rgba(120,153,141,0.30)] text-[#78998d] text-[10.5px] font-mono font-medium animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#78998d]" />
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
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#b8894f]/35 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[#181613]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className={`w-3.5 h-3.5 ${currentView === 'today' ? 'text-[#c89a5a]' : 'text-[var(--text-muted)]'}`} />
              <span>今天</span>
            </div>
            {isSessionRunning ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[#78998d]" />
            ) : (
              <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'today' ? 'text-[#b8894f]' : 'text-[var(--text-muted)]'}`}>01</span>
            )}
          </button>

          <button
            onClick={() => onSelectView('tracks')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'tracks'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#b8894f]/35 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[#181613]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className={`w-3.5 h-3.5 ${currentView === 'tracks' ? 'text-[#c89a5a]' : 'text-[var(--text-muted)]'}`} />
              <span>主线脉络</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'tracks' ? 'text-[#b8894f]' : 'text-[var(--text-muted)]'}`}>02</span>
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'history'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#b8894f]/35 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[#181613]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className={`w-3.5 h-3.5 ${currentView === 'history' ? 'text-[#c89a5a]' : 'text-[var(--text-muted)]'}`} />
              <span>历史轨迹</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'history' ? 'text-[#b8894f]' : 'text-[var(--text-muted)]'}`}>03</span>
          </button>

          <button
            onClick={() => onSelectView('inbox')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'inbox'
                ? 'bg-[#221c15] text-[var(--text-hero)] border border-[#b8894f]/35 shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[#181613]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className={`w-3.5 h-3.5 ${currentView === 'inbox' ? 'text-[#c89a5a]' : 'text-[var(--text-muted)]'}`} />
              <span>收集箱</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'inbox' ? 'text-[#b8894f]' : 'text-[var(--text-muted)]'}`}>04</span>
          </button>
        </div>

        {/* Hairline Divider with single subtle center accent */}
        <div className="px-2.5 my-1.5 flex items-center gap-2">
          <div className="h-[1px] bg-[#b8894f]/12 flex-1" />
          <span className="w-0.5 h-0.5 rounded-full bg-[#b8894f]/30" />
          <div className="h-[1px] bg-[#b8894f]/12 flex-1" />
        </div>

        {/* Pinned Cards Section */}
        <div className="px-2.5 py-1.5">
          <div className="flex items-center justify-between px-2.5 mb-1.5 type-l6 font-mono uppercase tracking-widest text-[var(--text-muted)] font-medium">
            <span>手边入口</span>
            <CockpitTooltip content="收拢新入口"><button
              onClick={onOpenAddCard}
              className="cockpit-icon-button cockpit-icon-button--neutral"
              aria-label="收拢新入口"
            >
              <Plus className="w-3.5 h-3.5" />
            </button></CockpitTooltip>
          </div>
          <div className="space-y-0.5">
            {pinnedCards.map(card => (
              <button
                key={card.id}
                onClick={() => onOpenCard(card)}
                className="w-full flex items-center px-2.5 py-1.5 rounded type-l5 text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[#181613] transition-colors group text-left cursor-pointer font-medium"
              >
                <span className="min-w-0 flex flex-col gap-0.5">
                  <span className="truncate">{card.title}</span>
                  {card.description && <span className="type-l6 font-normal text-[var(--text-muted)] truncate">{card.description}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-2.5 border-t border-[#b8894f]/15 space-y-0.5">
        <CockpitTooltip content="复制当前阶段、主线、Next 与最近记录的 Markdown 上下文"><button
          onClick={onOpenAiExport}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded type-l5 text-[var(--text-secondary)] hover:bg-[#181613] hover:text-[var(--text-hero)] transition-colors cursor-pointer font-medium"
          aria-label="复制驾驶舱上下文"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>复制驾驶舱上下文</span>
        </button></CockpitTooltip>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded type-l5 text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[#181613] transition-colors cursor-pointer font-medium"
        >
          <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>驾驶舱设置</span>
        </button>
      </div>
    </aside>
  );
};
