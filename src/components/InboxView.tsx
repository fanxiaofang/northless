import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  Archive,
  Trash2,
  Check
} from 'lucide-react';
import { InboxItem, Track } from '../types';
import { InlineEmptyState } from './InlineEmptyState';
import { CockpitTooltip } from './ui/CockpitTooltip';
import { CockpitConfirmAction } from './ui/CockpitConfirmAction';
import { CockpitSelect } from './ui/CockpitSelect';

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
  const captureTrackOptions = [
    { value: '', label: '不关联 (自由闪念)' },
    ...tracks.map(track => ({ value: track.id, label: `#${track.name}`, meta: track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓' })),
  ];
  const promotionTrackOptions = tracks.map(track => ({ value: track.id, label: `#${track.name}`, meta: track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓' }));

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
              <CockpitSelect
                value={selectedTrackId}
                onChange={setSelectedTrackId}
                ariaLabel="可选主线"
                options={captureTrackOptions}
                className="min-w-0 flex-1 sm:w-56"
              />
            </div>

            <div className="inbox-submit-controls flex items-center gap-2.5">
              <span className="type-l6 font-mono text-[var(--text-ghost)] hidden sm:inline select-none">⌘ + Enter</span>
              <button
                type="submit"
                className="cockpit-button cockpit-button--primary cursor-pointer"
              >
                <Plus aria-hidden="true" />
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

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleStartPromote(item)}
                      className="cockpit-button cockpit-button--secondary cockpit-button--brass-action cockpit-button--compact cursor-pointer"
                    >
                      <ArrowRight aria-hidden="true" />
                      <span>转为 Next</span>
                    </button>

                    <CockpitTooltip content="归档碎片">
                    <button
                      onClick={() => onArchiveInboxItem(item.id)}
                      className="cockpit-icon-button cockpit-icon-button--neutral cursor-pointer"
                      aria-label="归档碎片"
                    >
                      <Archive aria-hidden="true" />
                    </button></CockpitTooltip>

                    <CockpitConfirmAction tooltip="删除碎片" title="删除这条碎片？" description="这条收集箱内容将被永久移除。" onConfirm={() => onDeleteInboxItem(item.id)}>{({ ref, onClick, expanded }) => <button
                      ref={ref}
                      onClick={onClick}
                      className="cockpit-icon-button cockpit-icon-button--danger opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                      aria-label="删除碎片"
                      aria-expanded={expanded}
                    >
                      <Trash2 aria-hidden="true" />
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
                <CockpitSelect
                  value={targetTrackId}
                  onChange={setTargetTrackId}
                  ariaLabel="目标主线"
                  placeholder="选择目标主线..."
                  options={promotionTrackOptions}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium font-sans">Action 标题 (可执行的小动作)</label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  className="form-control form-control--single font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] type-l6 mb-1 font-medium font-sans">复杂度负荷</label>
                <div className="segmented-control compact flex gap-2" role="group" aria-label="复杂度负荷">
                  {(['light', 'normal', 'deep'] as const).map(eff => (
                    <button
                      key={eff}
                      type="button"
                      onClick={() => setActionEffort(eff)}
                      className={`segmented-item flex-1 cursor-pointer ${
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
                  className="cockpit-action-text cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="cockpit-button cockpit-button--primary cursor-pointer"
                >
                  <Check aria-hidden="true" />
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
