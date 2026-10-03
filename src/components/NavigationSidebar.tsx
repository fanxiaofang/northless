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
import { Card } from '../types';
import { CockpitTooltip } from './ui/CockpitTooltip';

interface NavigationSidebarProps {
  currentView: 'today' | 'tracks' | 'history' | 'inbox';
  onSelectView: (view: 'today' | 'tracks' | 'history' | 'inbox') => void;
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
  pinnedCards,
  onOpenCard,
  onOpenAddCard,
  onOpenSettings,
  onOpenAiExport,
  isSessionRunning,
}) => {
  return (
    <aside className="sidebar-root w-[220px] h-screen bg-[var(--surface-sidebar)] border-r border-[var(--border-accent-subtle)] flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="sidebar-structure-divider p-3 border-b border-[var(--border-accent-subtle)] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="sidebar-brand-mark">
              <Compass className="w-3.5 h-3.5 animate-[spin_60s_linear_infinite]" />
              <span className="absolute -top-0.5 -right-0.5 rivet" />
            </div>
            <div className="font-brand text-[13px] leading-tight tracking-wider font-semibold text-[var(--text-hero)] uppercase whitespace-nowrap flex items-center gap-1.5">
              <span>Gap Cockpit</span>
              <span className="text-[10px] text-[var(--accent-brass)] font-mono tracking-normal font-medium">v0</span>
            </div>
          </div>
          {isSessionRunning && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--effort-light-bg)] border border-[var(--border-success)] text-[var(--accent-verdigris)] text-[10.5px] font-mono font-medium animate-pulse shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-verdigris)]" />
              LIVE
            </div>
          )}
        </div>

        {/* Primary Views */}
        <div className="px-2.5 py-3 space-y-0.5">
          <button
            onClick={() => onSelectView('today')}
            className={`sidebar-nav-item w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'today'
                ? 'is-selected bg-[var(--surface-selected)] text-[var(--text-hero)] border border-[var(--border-accent)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[var(--surface-sidebar-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className={`w-3.5 h-3.5 ${currentView === 'today' ? 'text-[var(--accent-brass-hover)]' : 'text-[var(--text-muted)]'}`} />
              <span>今天</span>
            </div>
            {isSessionRunning ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-verdigris)]" />
            ) : (
              <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'today' ? 'text-[var(--accent-brass)]' : 'text-[var(--text-muted)]'}`}>01</span>
            )}
          </button>

          <button
            onClick={() => onSelectView('tracks')}
            className={`sidebar-nav-item w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'tracks'
                ? 'is-selected bg-[var(--surface-selected)] text-[var(--text-hero)] border border-[var(--border-accent)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[var(--surface-sidebar-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className={`w-3.5 h-3.5 ${currentView === 'tracks' ? 'text-[var(--accent-brass-hover)]' : 'text-[var(--text-muted)]'}`} />
              <span>主线脉络</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'tracks' ? 'text-[var(--accent-brass)]' : 'text-[var(--text-muted)]'}`}>02</span>
          </button>

          <button
            onClick={() => onSelectView('history')}
            className={`sidebar-nav-item w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'history'
                ? 'is-selected bg-[var(--surface-selected)] text-[var(--text-hero)] border border-[var(--border-accent)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[var(--surface-sidebar-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className={`w-3.5 h-3.5 ${currentView === 'history' ? 'text-[var(--accent-brass-hover)]' : 'text-[var(--text-muted)]'}`} />
              <span>历史轨迹</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'history' ? 'text-[var(--accent-brass)]' : 'text-[var(--text-muted)]'}`}>03</span>
          </button>

          <button
            onClick={() => onSelectView('inbox')}
            className={`sidebar-nav-item w-full flex items-center justify-between px-2.5 py-1.5 rounded type-l5 font-medium transition-all cursor-pointer ${
              currentView === 'inbox'
                ? 'is-selected bg-[var(--surface-selected)] text-[var(--text-hero)] border border-[var(--border-accent)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[var(--surface-sidebar-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className={`w-3.5 h-3.5 ${currentView === 'inbox' ? 'text-[var(--accent-brass-hover)]' : 'text-[var(--text-muted)]'}`} />
              <span>收集箱</span>
            </div>
            <span className={`type-l6 font-mono tracking-wider font-medium ${currentView === 'inbox' ? 'text-[var(--accent-brass)]' : 'text-[var(--text-muted)]'}`}>04</span>
          </button>
        </div>

        {/* Hairline Divider with single subtle center accent */}
        <div className="sidebar-section-divider px-2.5 my-1.5 flex items-center gap-2">
          <div className="sidebar-section-rule h-[1px] bg-[var(--accent-brass)]/12 flex-1" />
          <span className="sidebar-section-dot w-0.5 h-0.5 rounded-full bg-[var(--accent-brass)]/30" />
          <div className="sidebar-section-rule h-[1px] bg-[var(--accent-brass)]/12 flex-1" />
        </div>

        {/* Pinned Cards Section */}
        <div className="flex min-h-0 flex-1 flex-col px-2.5 py-1.5">
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
          <div className="sidebar-pinned-list">
            {pinnedCards.map(card => (
              <button
                key={card.id}
                onClick={() => onOpenCard(card)}
                className="sidebar-entry-row"
              >
                <span className="min-w-0 flex flex-col gap-0.5">
                  <span className="sidebar-entry-title">{card.title}</span>
                  {card.description && <span className="sidebar-entry-description">{card.description}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="sidebar-structure-divider p-2.5 border-t border-[var(--border-accent-subtle)] space-y-0.5">
        <CockpitTooltip content="整理当前主线、Next 与最近记录为 Markdown"><button
          onClick={onOpenAiExport}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded type-l5 text-[var(--text-secondary)] hover:bg-[var(--surface-sidebar-hover)] hover:text-[var(--text-hero)] transition-colors cursor-pointer font-medium"
          aria-label="复制当前上下文"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>复制当前上下文</span>
        </button></CockpitTooltip>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded type-l5 text-[var(--text-secondary)] hover:text-[var(--text-hero)] hover:bg-[var(--surface-sidebar-hover)] transition-colors cursor-pointer font-medium"
        >
          <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>设置</span>
        </button>
      </div>
    </aside>
  );
};
