import React, { useState } from 'react';
import { X, Moon, Check, Sparkles } from 'lucide-react';
import { LogEntry, Track } from '../../types';

interface EndTodayModalProps {
  currentDateStr: string;
  tracks: Track[];
  todayLogs: LogEntry[];
  onClose: () => void;
  onSubmitDayClose: (note?: string, carryForward?: string) => void;
}

export const EndTodayModal: React.FC<EndTodayModalProps> = ({
  currentDateStr,
  tracks,
  todayLogs,
  onClose,
  onSubmitDayClose,
}) => {
  const [reflection, setReflection] = useState('');
  const [carryForward, setCarryForward] = useState('');

  // Calculate track touches and minutes
  const trackMinutesMap: Record<string, number> = {};
  todayLogs.forEach(l => {
    if (l.track_id && l.duration_minutes) {
      trackMinutesMap[l.track_id] = (trackMinutesMap[l.track_id] || 0) + l.duration_minutes;
    }
  });

  const touchedTracks = tracks.filter(t => trackMinutesMap[t.id] !== undefined || todayLogs.some(l => l.track_id === t.id));

  const formatMinutes = (m: number) => {
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return `${h}h${rem > 0 ? ` ${rem}m` : ''}`;
    }
    return `${m}m`;
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitDayClose(reflection.trim() || undefined, carryForward.trim() || undefined);
    onClose();
  };

  return (
    <div className="cockpit-modal-overlay">
      <div className="cockpit-modal-panel p-6 sm:p-7 max-w-lg w-full space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#b8894f]" />
            <h3 className="type-l2 font-semibold text-[var(--text-hero)]">
              End Today · 给今天一个安静的边界
            </h3>
          </div>
          <p className="type-l5 text-[var(--text-secondary)] font-sans">
            {currentDateStr} · 审视今天留下的印记，卸下心智负担。
          </p>
        </div>

        {/* Summary of what moved */}
        <div className="brass-panel p-4 rounded-lg space-y-3">
          <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[#b8894f]">
            今天留下了
          </div>

          {touchedTracks.length === 0 ? (
            <div className="type-l5 text-[var(--text-secondary)] font-sans">今天没有记录主线投入，静静休整也是探索的一部分。</div>
          ) : (
            <div className="space-y-2">
              {touchedTracks.map(t => (
                <div key={t.id} className="flex items-center justify-between type-l5">
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b8894f]" />
                    <span className="font-medium font-sans">{t.name}</span>
                  </div>
                  <span className="font-mono text-[#b8894f] font-medium">
                    {trackMinutesMap[t.id] ? formatMinutes(trackMinutesMap[t.id]) : '触达'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleFinish} className="space-y-4 type-l5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[var(--text-muted)] font-medium font-sans">今天一句话？ (Optional)</label>
              <span className="type-l6 font-mono text-[var(--text-ghost)]">可不填</span>
            </div>
            <input
              type="text"
              placeholder="如: 状态平稳，把核心接口逻辑理清楚了。"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f] font-medium font-sans"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[var(--text-muted)] font-medium font-sans">明天有什么想接着做？ (Optional)</label>
              <span className="type-l6 font-mono text-[var(--text-ghost)]">可不填</span>
            </div>
            <input
              type="text"
              placeholder="如: 继续跑 MCP Server 示例。"
              value={carryForward}
              onChange={e => setCarryForward(e.target.value)}
              className="w-full bg-[#11100f] border border-[#b8894f]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f] font-medium font-sans"
            />
          </div>

          {/* Guilt-free design reminder */}
          <div className="p-3 rounded bg-[#171411] border border-[#b8894f]/15 type-l5 text-[var(--text-secondary)] leading-relaxed font-sans">
            🌿 <strong className="text-[var(--text-primary)]">设计原则</strong>: End Today 不产生 streak 打卡火焰。今天未 Close 也没有欠账，明天随时平稳接续。
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
            >
              继续看今日
            </button>
            <button
              type="submit"
              className="brass-button px-5 py-2 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#b8894f]" />
              <span>结束今天</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
