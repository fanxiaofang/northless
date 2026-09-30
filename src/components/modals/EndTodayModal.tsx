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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="brass-panel-elevated p-6 sm:p-7 rounded-lg max-w-lg w-full space-y-6 border border-[#c69956]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#dfbf85]" />
            <h3 className="font-display text-xl font-bold text-[var(--text-hero)]">
              End Today · 给今天一个安静的边界
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            {currentDateStr} · 审视今天留下的印记，卸下心智负担。
          </p>
        </div>

        {/* Summary of what moved */}
        <div className="brass-panel p-4 rounded-lg space-y-3">
          <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
            今天留下了
          </div>

          {touchedTracks.length === 0 ? (
            <div className="text-xs text-[var(--text-secondary)]">今天没有记录主线投入，静静休整也是探索的一部分。</div>
          ) : (
            <div className="space-y-2">
              {touchedTracks.map(t => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#dfbf85]" />
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <span className="font-mono text-[#c69956]">
                    {trackMinutesMap[t.id] ? formatMinutes(trackMinutesMap[t.id]) : '触达'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleFinish} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[var(--text-muted)]">今天一句话？ (Optional)</label>
              <span className="text-[10px] text-[var(--text-muted)]">可不填</span>
            </div>
            <input
              type="text"
              placeholder="如: 状态平稳，把核心接口逻辑理清楚了。"
              value={reflection}
              onChange={e => setReflection(e.target.value)}
              className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[var(--text-muted)]">明天有什么想接着做？ (Optional)</label>
              <span className="text-[10px] text-[var(--text-muted)]">可不填</span>
            </div>
            <input
              type="text"
              placeholder="如: 继续跑 MCP Server 示例。"
              value={carryForward}
              onChange={e => setCarryForward(e.target.value)}
              className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
            />
          </div>

          {/* Guilt-free design reminder */}
          <div className="p-3 rounded bg-[#171411] border border-[#c69956]/15 text-[11px] text-[var(--text-muted)] leading-relaxed">
            🌿 <strong>设计原则</strong>: End Today 不产生 streak 打卡火焰。今天未 Close 也没有欠账，明天随时平稳接续。
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              继续看今日
            </button>
            <button
              type="submit"
              className="brass-button px-5 py-2 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-[#dfbf85]" />
              <span>结束今天</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
