import React, { useState, useRef, useEffect } from 'react';
import {
  Inbox,
  Plus,
  ArrowRight,
  Archive,
  Trash2,
  Check,
  Tag,
  ChevronDown
} from 'lucide-react';
import { InboxItem, Track } from '../types';

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
        className="flex items-center justify-between gap-2 bg-[#181512] hover:bg-[#1f1b16] border border-[#c69956]/25 hover:border-[#c69956]/50 rounded px-2.5 py-1.5 type-l5 text-[#ded7cd] transition-colors focus:outline-none focus:border-[#dfbf85] w-full text-left"
      >
        <span className="truncate">
          {selectedTrack ? `#${selectedTrack.name}` : emptyLabel}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8a7f72] transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 min-w-[220px] w-full max-h-56 overflow-y-auto bg-[#181512] border border-[#c69956]/35 rounded-md shadow-2xl py-1 z-50">
          {allowEmpty && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 type-l5 transition-colors flex items-center justify-between ${
                !value ? 'bg-[#2a2218] text-[#dfbf85] font-medium' : 'text-[#8a7f72] hover:bg-[#201c17] hover:text-[#ded7cd]'
              }`}
            >
              <span>{emptyLabel}</span>
              {!value && <Check className="w-3.5 h-3.5 text-[#dfbf85]" />}
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
                className={`w-full text-left px-3 py-1.5 type-l5 transition-colors flex items-center justify-between ${
                  isSelected ? 'bg-[#2a2218] text-[#dfbf85] font-medium' : 'text-[#ded7cd] hover:bg-[#201c17]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.role === 'main' ? 'bg-[#dfbf85]' : 'bg-[#7a6f60]'}`} />
                  <span className="truncate">#{t.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#dfbf85] shrink-0" />}
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
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[#e6ddd0] p-6 lg:p-10">
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Header - Deliberately no unread count! */}
        <header className="pb-6 border-b border-[#c69956]/20">
          <div className="flex items-center gap-2 type-l6 font-mono text-[#82776b] tracking-wider uppercase mb-1">
            <span>FREE CAPTURE / 允许自由腐烂，无需清零压力</span>
          </div>
          <h1 className="type-l1 font-display font-bold text-[#f7f0e5] flex items-baseline gap-2.5">
            <span>收集箱</span>
            <span className="type-l6 font-mono font-normal text-[#82776b] tracking-widest">/ INBOX</span>
          </h1>
          <p className="type-l6 text-[#82776b] font-sans mt-0.5">
            想到什么，扔进去，结束。无需优先级、截止日或整理负担。
          </p>
        </header>

        {/* Quick Capture Input */}
        <form onSubmit={handleSubmit} className="matrix-panel p-5 rounded-lg space-y-3">
          <div className="flex items-start gap-3">
            <textarea
              placeholder="随时捕捉闪念（如：看看 MCP transport 实现细节、interval DP 专题...）"
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e);
                }
              }}
              rows={2}
              className="w-full bg-[#161412] border border-[#c69956]/20 rounded-md p-3 type-l4 text-[#f7f0e5] focus:outline-none focus:border-[#dfbf85] resize-none"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 type-l5">
              <span className="text-[#82776b]">可选主线:</span>
              <CustomTrackSelect
                tracks={tracks}
                value={selectedTrackId}
                onChange={setSelectedTrackId}
                allowEmpty
                emptyLabel="不关联 (自由闪念)"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="type-l6 font-mono text-[#82776b] hidden sm:inline">⌘ + Enter</span>
              <button
                type="submit"
                className="brass-button px-4 py-1.5 rounded type-l5 font-semibold text-[#fcf9f2] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#dfbf85]" />
                <span>投掷记录</span>
              </button>
            </div>
          </div>
        </form>

        {/* Capture Stream */}
        <div className="space-y-3">
          {activeItems.length === 0 ? (
            <div className="py-14 text-center text-[#544b41] space-y-1.5 select-none border border-dashed border-[#c69956]/15 rounded-lg bg-[#141210]/20">
              <div className="type-l6 font-mono text-[#82776b] tracking-widest uppercase">[ CAPTURE TRAY EMPTY ]</div>
              <p className="type-l5 text-[#82776b]">暂无未归整的灵感碎片 · 闪念可随时在此停泊</p>
            </div>
          ) : (
            activeItems.map(item => {
              const track = tracks.find(t => t.id === item.track_id);

              return (
                <div
                  key={item.id}
                  className="matrix-panel p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors"
                >
                  <div className="space-y-1">
                    <p className="type-l4 text-[#f2ede4] leading-relaxed">
                      {item.content}
                    </p>
                    <div className="flex items-center gap-2 type-l6 text-[#8a7f72]">
                      <span>{item.created_at}</span>
                      {track && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#c69956] font-medium">#{track.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleStartPromote(item)}
                      className="px-2.5 py-1 rounded type-l5 text-[#dfbf85] bg-[#221c15] hover:bg-[#2b241c] border border-[#c69956]/30 transition-colors flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>转为 Next</span>
                    </button>

                    <button
                      onClick={() => onArchiveInboxItem(item.id)}
                      className="p-1 text-[#8a7f72] hover:text-[#ded7cd] transition-colors"
                      title="归档"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteInboxItem(item.id)}
                      className="p-1 text-[#8a7f72] hover:text-[#e06c75] transition-colors opacity-0 group-hover:opacity-100"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
          <div className="matrix-panel p-6 rounded-lg max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="type-l3 font-bold text-[#f7f2ea]">
              将想法转化为清晰的 Next 行动
            </h3>
            <form onSubmit={handleConfirmPromote} className="space-y-3 type-l5">
              <div>
                <label className="block text-[#9c9183] mb-1">目标主线</label>
                <CustomTrackSelect
                  tracks={tracks}
                  value={targetTrackId}
                  onChange={setTargetTrackId}
                  emptyLabel="选择目标主线..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[#9c9183] mb-1">Action 标题 (可执行的小动作)</label>
                <input
                  type="text"
                  value={actionTitle}
                  onChange={e => setActionTitle(e.target.value)}
                  className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[#f7f2ea] focus:outline-none focus:border-[#dfbf85]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#9c9183] type-l6 mb-1">复杂度负荷</label>
                <div className="flex gap-2">
                  {(['light', 'normal', 'deep'] as const).map(eff => (
                    <button
                      key={eff}
                      type="button"
                      onClick={() => setActionEffort(eff)}
                      className={`flex-1 py-1.5 rounded type-l5 transition-colors ${
                        actionEffort === eff
                          ? eff === 'light'
                            ? 'tag-effort-light font-medium'
                            : eff === 'deep'
                            ? 'tag-effort-deep font-medium'
                            : 'tag-effort-normal font-medium'
                          : 'bg-[#181512] text-[#8a7f72] border border-[#c69956]/15'
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
                  className="px-3 py-1.5 text-[#8a7f72] hover:text-[#ded7cd]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="brass-button px-4 py-1.5 font-semibold text-[#fcf9f2] rounded flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#dfbf85]" />
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
