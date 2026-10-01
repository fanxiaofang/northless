import React, { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Layers,
  Clock,
  Inbox,
  Play,
  Plus,
  Sparkles,
  Settings,
  RotateCw,
  ExternalLink,
  X
} from 'lucide-react';
import { Card } from '../../types';

interface CommandPaletteModalProps {
  onClose: () => void;
  onSelectView: (view: 'today' | 'tracks' | 'history' | 'inbox') => void;
  onOpenLogModal: () => void;
  onOpenEndTodayModal: () => void;
  onOpenReentryModal: () => void;
  onOpenAiExport: () => void;
  onOpenSettings: () => void;
  onOpenCard: (card: Card) => void;
  cards: Card[];
  isSessionRunning: boolean;
  onToggleSession: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  onClose,
  onSelectView,
  onOpenLogModal,
  onOpenEndTodayModal,
  onOpenReentryModal,
  onOpenAiExport,
  onOpenSettings,
  onOpenCard,
  cards,
  isSessionRunning,
  onToggleSession,
}) => {
  const [query, setQuery] = useState('');

  const commands = [
    {
      id: 'view_today',
      category: '页面导航',
      title: '前往 Today · 今天',
      shortcut: '1',
      icon: Calendar,
      action: () => {
        onSelectView('today');
        onClose();
      },
    },
    {
      id: 'view_tracks',
      category: '页面导航',
      title: '前往 Tracks · 主线脉络',
      shortcut: '2',
      icon: Layers,
      action: () => {
        onSelectView('tracks');
        onClose();
      },
    },
    {
      id: 'view_history',
      category: '页面导航',
      title: '前往 History · 历史轨迹',
      shortcut: '3',
      icon: Clock,
      action: () => {
        onSelectView('history');
        onClose();
      },
    },
    {
      id: 'view_inbox',
      category: '页面导航',
      title: '前往 Inbox · 收集箱',
      shortcut: '4',
      icon: Inbox,
      action: () => {
        onSelectView('inbox');
        onClose();
      },
    },
    {
      id: 'action_log',
      category: '核心操作',
      title: '记一下刚刚做了什么 (Log something)',
      shortcut: 'L',
      icon: Plus,
      action: () => {
        onClose();
        onOpenLogModal();
      },
    },
    {
      id: 'action_session',
      category: '核心操作',
      title: isSessionRunning ? '暂停 / 恢复当前专注 Session' : '开启专注计时 (Start Session)',
      shortcut: 'S',
      icon: Play,
      action: () => {
        onClose();
        onToggleSession();
      },
    },
    {
      id: 'action_end_today',
      category: '核心操作',
      title: '结束今天 (End Today)',
      shortcut: 'E',
      icon: Calendar,
      action: () => {
        onClose();
        onOpenEndTodayModal();
      },
    },
    {
      id: 'action_reentry',
      category: '核心操作',
      title: '断线平稳接回模式 (Re-entry Flow)',
      shortcut: 'R',
      icon: RotateCw,
      action: () => {
        onClose();
        onOpenReentryModal();
      },
    },
    {
      id: 'action_ai_export',
      category: '工具',
      title: '复制 AI 上下文 Prompt (Copy AI Context)',
      shortcut: 'C',
      icon: Sparkles,
      action: () => {
        onClose();
        onOpenAiExport();
      },
    },
    {
      id: 'action_settings',
      category: '工具',
      title: '打开驾驶舱偏好与数据管理 (Settings)',
      shortcut: ',',
      icon: Settings,
      action: () => {
        onClose();
        onOpenSettings();
      },
    },
  ];

  // Also include cards as searchable items
  cards.forEach(card => {
    commands.push({
      id: `card_${card.id}`,
      category: '手边入口 Cards',
      title: `打开 ${card.title}`,
      shortcut: '↗',
      icon: ExternalLink,
      action: () => {
        onClose();
        onOpenCard(card);
      },
    });
  });

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="cockpit-modal-overlay items-start pt-24 p-4">
      <div className="cockpit-modal-panel max-w-xl w-full overflow-hidden animate-fadeIn">
        {/* Search Input */}
        <div className="p-3.5 border-b border-[#b8894f]/20 flex items-center gap-3 bg-[#181512]">
          <Search className="w-4 h-4 text-[#b8894f]" />
          <input
            type="text"
            placeholder="输入指令或搜索动作..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent type-l4 text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-ghost)] font-sans font-medium"
            autoFocus
          />
          <kbd className="px-1.5 py-0.5 type-l6 font-mono bg-[#201c18] border border-[#3b3226] rounded text-[var(--text-muted)] font-medium">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center type-l5 text-[var(--text-secondary)] font-sans">
              未找到匹配指令
            </div>
          ) : (
            filtered.map(cmd => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between p-2.5 rounded hover:bg-[#201c17] text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#b8894f] transition-colors" />
                    <div>
                      <div className="type-l4 font-medium text-[var(--text-primary)] group-hover:text-[var(--text-hero)] transition-colors">{cmd.title}</div>
                      <div className="type-l6 font-mono font-medium text-[var(--text-muted)]">{cmd.category}</div>
                    </div>
                  </div>
                  <kbd className="px-2 py-0.5 type-l6 font-mono bg-[#161411] border border-[#30271c] rounded text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:border-[#b8894f]/30 transition-colors font-medium">
                    {cmd.shortcut}
                  </kbd>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
