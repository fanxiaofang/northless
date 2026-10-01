import React, { useState } from 'react';
import { Clock, BookOpen, X, Check } from 'lucide-react';
import { EntryType, Track } from '../../types';

interface LogModalProps {
  tracks: Track[];
  onClose: () => void;
  onSubmit: (data: {
    type: EntryType;
    track_id?: string;
    content: string;
    duration_minutes?: number;
    started_at?: string;
    ended_at?: string;
  }) => void;
}

export const LogModal: React.FC<LogModalProps> = ({ tracks, onClose, onSubmit }) => {
  const [type, setType] = useState<EntryType>('session');
  const [trackId, setTrackId] = useState<string>(tracks[0]?.id || '');
  const [content, setContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [timeRange, setTimeRange] = useState('');

  // Autofill current time range roughly
  const handleUseRecentTime = () => {
    const now = new Date();
    const endH = String(now.getHours()).padStart(2, '0');
    const endM = String(now.getMinutes()).padStart(2, '0');

    const past = new Date(now.getTime() - durationMinutes * 60000);
    const startH = String(past.getHours()).padStart(2, '0');
    const startM = String(past.getMinutes()).padStart(2, '0');

    setTimeRange(`${startH}:${startM} - ${endH}:${endM}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    let started_at: string | undefined;
    let ended_at: string | undefined;

    if (timeRange.includes('-') || timeRange.includes('─')) {
      const parts = timeRange.split(/[-─]/).map(s => s.trim());
      if (parts.length === 2) {
        started_at = parts[0];
        ended_at = parts[1];
      }
    } else if (timeRange.trim()) {
      started_at = timeRange.trim();
    }

    onSubmit({
      type,
      track_id: trackId ? trackId : undefined,
      content: content.trim(),
      duration_minutes: type === 'session' ? durationMinutes : undefined,
      started_at,
      ended_at,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="brass-panel-elevated p-6 rounded-lg max-w-md w-full space-y-5 border border-[#c69956]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rivet" />
            <h3 className="type-l3 font-semibold text-[var(--text-hero)]">
              记一下刚刚发生了什么
            </h3>
          </div>
          <p className="type-l5 text-[var(--text-secondary)] font-sans">
            记录真实发生的事。不仅是学习专注，生活娱乐也能留下痕迹。
          </p>
        </div>

        {/* Type Switcher */}
        <div className="flex gap-2 p-1 bg-[#181512] rounded border border-[#b8894f]/20">
          <button
            type="button"
            onClick={() => setType('session')}
            className={`flex-1 py-1.5 rounded type-l5 flex items-center justify-center gap-1.5 transition-colors font-medium cursor-pointer ${
              type === 'session'
                ? 'bg-[#2b231a] text-[var(--text-hero)] border border-[#b8894f]/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#b8894f]" />
            <span>专注 Session (推进主线)</span>
          </button>
          <button
            type="button"
            onClick={() => setType('note')}
            className={`flex-1 py-1.5 rounded type-l5 flex items-center justify-center gap-1.5 transition-colors font-medium cursor-pointer ${
              type === 'note'
                ? 'bg-[#2b231a] text-[var(--text-hero)] border border-[#b8894f]/40 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#b8894f]" />
            <span>日常随笔 Note (生活记录)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 type-l5">
          <div>
            <label className="block text-[var(--text-muted)] mb-1 font-medium font-sans">
              关联主线 (可选)
            </label>
            <select
              value={trackId}
              onChange={e => setTrackId(e.target.value)}
              className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f] font-medium"
            >
              <option value="">{type === 'session' ? '不关联主线 (自由专注)' : '不关联主线 (日常生活随笔)'}</option>
              {tracks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role === 'main' ? '主线' : t.role === 'maintenance' ? '保温' : '暂缓'})
                </option>
              ))}
            </select>
          </div>

          {type === 'session' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium font-sans">时长 (分钟)</label>
                <input
                  type="number"
                  min="1"
                  step="5"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] font-mono font-medium focus:outline-none focus:border-[#b8894f]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[var(--text-muted)] font-medium font-sans">起止时间 (可选)</label>
                  <button
                    type="button"
                    onClick={handleUseRecentTime}
                    className="type-l6 font-mono text-[#b8894f] hover:underline cursor-pointer font-medium"
                  >
                    填入刚刚
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="如: 14:10 - 15:05"
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                  className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] font-mono font-medium focus:outline-none focus:border-[#b8894f]"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[var(--text-muted)] font-medium font-sans">记录时间点 (可选)</label>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const h = String(now.getHours()).padStart(2, '0');
                    const m = String(now.getMinutes()).padStart(2, '0');
                    setTimeRange(`${h}:${m}`);
                  }}
                  className="type-l6 font-mono text-[#b8894f] hover:underline cursor-pointer font-medium"
                >
                  填入此刻
                </button>
              </div>
              <input
                type="text"
                placeholder="如: 16:30"
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] font-mono font-medium focus:outline-none focus:border-[#b8894f]"
              />
            </div>
          )}

          <div>
            <label className="block text-[var(--text-muted)] mb-1 font-medium font-sans">
              {type === 'session' ? '具体做了什么？' : '记录此刻的想法或生活'}
            </label>
            <textarea
              placeholder={
                type === 'session'
                  ? '如: tool calling 跑通，完成首个天气工具调试'
                  : '如: 下午散步了一会儿，思考了下周的探索路线'
              }
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f] h-20 resize-none font-medium font-sans"
              required
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className="brass-button px-4 py-1.5 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-[#b8894f]" />
              <span>记入今日时间线</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
