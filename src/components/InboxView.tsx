import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ArrowRight,
  Archive,
  Trash2,
  Check,
  ChevronDown
} from 'lucide-react';
import { InboxItem, Track } from '../types';
import { InlineEmptyState } from './InlineEmptyState';
import { CockpitTooltip } from './ui/CockpitTooltip';
import { CockpitConfirmAction } from './ui/CockpitConfirmAction';

interface CustomTrackSelectProps {
  tracks: Track[];
  value: string;
  onChange: (val: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}

const CustomTrackSelect: React.FC<CustomTrackSelectProps> = ({
  tracks,
  value,
  onChange,
  allowEmpty = false,
  emptyLabel = '不关联 (自由闪念)',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedTrack = tracks.find(t => t.id === value);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center justify-between gap-2 bg-[#151412] hover:bg-[#1c1a17] border border-[#b8894f]/20 hover:border-[#b8894f]/40 rounded px-2.5 py-1.5 type-l5 text-[var(--text-primary)] transition-colors focus:outline-none focus:border-[#b8894f] w-full text-left cursor-pointer"
      >
        <span className="truncate">
          {selectedTrack ? `#${selectedTrack.name}` : emptyLabel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 min-w-[220px] w-full max-h-56 overflow-y-auto bg-[#171513] border border-[#b8894f]/30 rounded-md shadow-2xl py-1 z-50">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 type-l5 transition-colors flex items-center justify-between cursor-pointer ${
                !value ? 'bg-[#251f18] text-[#c89a5a] font-medium' : 'text-[var(--text-muted)] hover:bg-[#1e1a16] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{emptyLabel}</span>
              {!value && <Check className="w-3.5 h-3.5 text-[#c89a5a]" />}
            </button>
          )}

          {tracks.map(t => {
            const isSelected = t.id === value;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onChange(t.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 type-l5 transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-[#251f18] text-[#c89a5a] font-medium' : 'text-[var(--text-primary)] hover:bg-[#1e1a16]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.role === 'main' ? 'bg-[#b8894f]' : 'bg-[#615749]'}`} />
                  <span className="truncate">#{t.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#c89a5a] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface InboxViewProps {
  inboxItems: InboxItem[];
  tracks: Track[];
  onAddInboxItem: (content: string, trackId?: string) => void;
  onPromoteToNext: (item: InboxItem, trackId: string, title: string, effort: 'light' | 'normal' | 'deep') => void;
  onArchiveInboxItem: (itemId: string) => void;
  onDeleteInboxItem: (itemId: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  inboxItems,
  tracks,
  onAddInboxItem,
  onPromoteToNext,
  onArchiveInboxItem,
  onDeleteInboxItem,
}) => {
  const [content, setContent] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [promotingItemId, setPromotingItemId] = useState<string | null>(null);

  // Promotion modal form
  const [targetTrackId, setTargetTrackId] = useState<string>('');
  const [actionTitle, setActionTitle] = useState<string>('');
  const [actionEffort, setActionEffort] = useState<'light' | 'normal' | 'deep'>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAddInboxItem(content.trim(), selectedTrackId || undefined);
    setContent('');
    setSelectedTrackId('');
  };

  const handleStartPromote = (item: InboxItem) => {
    setPromotingItemId(item.id);
    setTargetTrackId(item.track_id || tracks[0]?.id || '');
    setActionTitle(item.content);
    setActionEffort('normal');
  };

  const handleConfirmPromote = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inboxItems.find(i => i.id === promotingItemId);
    if (!item || !actionTitle.trim() || !targetTrackId) return;
    onPromoteToNext(item, targetTrackId, actionTitle.trim(), actionEffort);
    setPromotingItemId(null);
  };

  const activeItems = inboxItems.filter(i => i.status === 'inbox');

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[var(--text-primary)] p-6 lg:p-10">
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Header - Deliberately no unread count */}
        <header className="pb-6 border-b border-[#b8894f]/15">
          <div className="flex items-center gap-2 type-l6 font-mono text-[var(--text-ghost)] tracking-wider uppercase mb-1 select-none">
            <span>FREE CAPTURE / 允许自由腐烂，无需清零压力</span>
          </div>
          <h1 className="type-l1 font-display font-semibold text-[var(--text-hero)] flex items-baseline gap-2.5">
            <span>收集箱</span>
            <span className="type-l6 font-mono font-normal text-[var(--text-ghost)] tracking-widest">/ INBOX</span>
          </h1>
          <p className="section-description">
            想到什么，扔进去，结束。无需优先级、截止日或整理负担。
          </p>
        </header>

        {/* Quick Capture Input Tray: one continuous optical surface with a shallow writing plane */}
        <form onSubmit={handleSubmit} className="surface-optic-soft inbox-capture-surface rounded-lg">
          <div className="inbox-capture-slot">
            <textarea
              placeholder="随时捕捉闪念（如：看看 MCP transport 实现细节、interval DP 专题...）"
              aria-label="记录一条闪念"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
              rows={2}
              className="inbox-capture-input w-full bg-transparent border-0 p-0 journal-input text-[var(--text-primary)] focus:outline-none focus:ring-0 resize-none"
              autoFocus
            />
          </div>

          <div className="inbox-capture-actions">
            <div className="inbox-track-picker flex min-w-0 flex-1 items-center gap-2 type-l5 font-medium sm:flex-none">
              <span className="shrink-0 whitespace-nowrap text-[var(--text-secondary)] font-mono">可选主线:</span>
              <CustomTrackSelect
                tracks={tracks}
                value={selectedTrackId}
                onChange={setSelectedTrackId}
                allowEmpty
                emptyLabel="不关联 (自由闪念)"
                className="min-w-0 flex-1 sm:flex-none"
              />
            </div>

            <div className="inbox-submit-controls flex items-center gap-2.5">
              <span className="type-l6 font-mono text-[var(--text-ghost)] hidden sm:inline select-none">⌘ + Enter</span>
              <button
                type="submit"
                className="brass-button px-4 py-1.5 rounded type-l5 font-medium text-[var(--text-hero)] flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#b8894f]" />
                <span>投掷记录</span>
              </button>
            </div>
          </div>
        </form>

        {/* Capture Stream */}
        <div className="space-y-3">
          {activeItems.length === 0 ? (
            <div className="inbox-empty-state select-none">
              <InlineEmptyState label="暂无碎片" description="闪念可以先停在这里，无需立即处理。" />
            </div>
          ) : (
            activeItems.map(item => {
              const track = tracks.find(t => t.id === item.track_id);

              return (
                <div
                  key={item.id}
                  className="surface-card p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors"
                >
                  <div className="space-y-1">
                    <p className="journal-content text-[var(--text-primary)] leading-relaxed">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 type-l6 text-[var(--text-muted)] font-mono font-medium">
                      <span>{item.created_at}</span>
                      {track && (
                        <>
                          <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                          <span className="text-[#b8894f] font-medium font-sans">#{track.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <CockpitTooltip content="归档碎片"><button
                      onClick={() => handleStartPromote(item)}
                      className="btn-secondary px-2.5 py-1 rounded type-l5 text-[var(--text-primary)] hover:text-[var(--text-hero)] transition-colors flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <ArrowRight className="w-3 h-3 text-[#b8894f]" />
                      <span>转为 Next</span>
                    </button>

                    <button
                      onClick={() => onArchiveInboxItem(item.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      aria-label="归档碎片"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button></CockpitTooltip>

                    <CockpitConfirmAction tooltip="删除碎片" title="删除这条碎片？" description="这条收集箱内容将被永久移除。" onConfirm={() => onDeleteInboxItem(item.id)}>{({ ref, onClick, expanded }) => <button
                      ref={ref}
                      onClick={onClick}
                      className="p-1 text-[var(--text-muted)] hover:text-[#e06c75] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      aria-label="删除碎片"
                      aria-expanded={expanded}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>}</CockpitConfirmAction>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Promote to Track Action Modal */}
      {promotingItemId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="brass-panel-elevated p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl border border-[#b8894f]/35">
            <h3 className="type-l3 font-semibold text-[var(--text-hero)]">
              将想法转化为清晰的 Next 行动
            </h3>
            <form onSubmit={handleConfirmPromote} className="space-y-3 type-l5">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium font-sans">目标主线</label>
                <CustomTrackSelect
                  tracks={tracks}
                  value={targetTrackId}
                  onChange={setTargetTrackId}
                  emptyLabel="选择目标主线..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium font-sans">Action 标题 (可执行的小动作)</label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  className="w-full bg-[#141311] border border-[#b8894f]/20 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f] font-medium font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] type-l6 mb-1 font-medium font-sans">复杂度负荷</label>
                <div className="flex gap-2">
                  {(['light', 'normal', 'deep'] as const).map(eff => (
                    <button
                      key={eff}
                      type="button"
                      onClick={() => setActionEffort(eff)}
                      className={`flex-1 py-1.5 rounded type-l5 transition-colors cursor-pointer font-medium ${
                        actionEffort === eff
                          ? eff === 'light'
                            ? 'tag-effort-light font-medium'
                            : eff === 'deep'
                            ? 'tag-effort-deep font-medium'
                            : 'tag-effort-normal font-medium'
                          : 'bg-[#151412] text-[var(--text-muted)] border border-[#b8894f]/15'
                      }`}
                    >
                      {eff === 'light' ? '轻量' : eff === 'normal' ? '正常' : '深入'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setPromotingItemId(null)}
                  className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="brass-button px-4 py-1.5 font-medium text-[var(--text-hero)] rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#c89a5a]" />
                  <span>转化并收纳</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
