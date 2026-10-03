import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DayClose, LogEntry, Track } from '../types';
import { ChronographLedger } from './ChronographLedger';
import { CockpitTooltip } from './ui/CockpitTooltip';

interface HistoryViewProps {
  tracks: Track[];
  logs: LogEntry[];
  dayCloses: DayClose[];
  currentDateStr: string;
}

const parseStartedAtMinutes = (startedAt?: string): number | null => {
  if (!startedAt) return null;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(startedAt);
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
};

const sortEntriesByStartedAt = (entries: LogEntry[]): LogEntry[] =>
  entries
    .map((entry, index) => ({ entry, index, minutes: parseStartedAtMinutes(entry.started_at) }))
    .sort((a, b) => {
      if (a.minutes === null) return b.minutes === null ? a.index - b.index : 1;
      if (b.minutes === null) return -1;
      return a.minutes - b.minutes || a.index - b.index;
    })
    .map(({ entry }) => entry);

export const HistoryView: React.FC<HistoryViewProps> = ({
  tracks,
  logs,
  dayCloses,
  currentDateStr,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [showDurationStats, setShowDurationStats] = useState<boolean>(false);

  // Compute 7 days of the selected week (Mon to Sun)
  const getWeekDays = (offset: number) => {
    const today = new Date(currentDateStr);
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday + offset * 7);

    const days: { dateStr: string; dayName: string; shortDate: string }[] = [];
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: dayNames[i],
        shortDate: `${d.getMonth() + 1}/${d.getDate()}`,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(weekOffset);
  const startDateStr = weekDays[0].dateStr;
  const endDateStr = weekDays[6].dateStr;

  // Filter logs for this week
  const weekLogs = logs.filter(l => l.date >= startDateStr && l.date <= endDateStr);

  // Calculate track touches matrix
  const trackMatrix = tracks.map(track => {
    const touchedDays = weekDays.map(day => {
      const hasTouch = weekLogs.some(l => l.track_id === track.id && l.date === day.dateStr);
      return hasTouch;
    });
    const touchCount = touchedDays.filter(Boolean).length;
    const totalMinutes = weekLogs
      .filter(l => l.track_id === track.id)
      .reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0);

    return {
      track,
      touchedDays,
      touchCount,
      totalMinutes,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[var(--text-primary)] p-6 lg:p-10">
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border-accent-subtle)] gap-4">
          <div>
            <div className="flex items-center gap-2 type-l6 font-mono text-[var(--text-ghost)] tracking-wider uppercase mb-1 font-medium">
              <span>TRAJECTORY / 轨迹，不是成绩单</span>
            </div>
            <h1 className="type-l1 font-display font-semibold text-[var(--text-hero)] flex items-baseline gap-2.5">
              <span>历史轨迹</span>
              <span className="type-l6 font-mono font-normal text-[var(--text-ghost)] tracking-widest">/ ARCHIVE</span>
            </h1>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-2 bg-[var(--surface-panel-subtle)] px-3 py-1.5 rounded-lg border border-[var(--border-accent-muted)] self-start sm:self-auto">
            <CockpitTooltip content="上一周"><button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-brass-hover)] transition-colors cursor-pointer"
              aria-label="上一周"
            >
              <ChevronLeft className="w-4 h-4" />
            </button></CockpitTooltip>

            <span className="type-l5 font-medium text-[var(--text-primary)] px-2 font-mono">
              {weekDays[0].shortDate} ─ {weekDays[6].shortDate}
              {weekOffset === 0 && <span className="text-[var(--accent-brass)] ml-1.5 font-sans font-medium">(本周)</span>}
            </span>

            <CockpitTooltip content="下一周"><button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className={`p-1 transition-colors ${
                weekOffset >= 0 ? 'text-[var(--text-ghost)] cursor-not-allowed' : 'text-[var(--text-muted)] hover:text-[var(--accent-brass-hover)] cursor-pointer'
              }`}
              aria-label="下一周"
            >
              <ChevronRight className="w-4 h-4" />
            </button></CockpitTooltip>
          </div>
        </header>

        {/* Weekly Touch Matrix (The core optical reference - Dedicated warm ambient micro-glow) */}
        <div className="surface-optic-strong matrix-panel p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>周主线触达矩阵</span>
              </h2>
              <p className="section-description">
                看见哪条主线在这周移动了，没有红黄绿考核，没有打卡焦虑
              </p>
            </div>

            <button
              onClick={() => setShowDurationStats(prev => !prev)}
              className="type-l5 text-[var(--text-secondary)] hover:text-[var(--text-hero)] flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <span>{showDurationStats ? '隐藏时间明细' : '查看投入时间'}</span>
              {showDurationStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="py-2.5 type-l5 font-display text-[var(--text-muted)] font-medium w-40">主线</th>
                  {weekDays.map(d => (
                    <th key={d.dateStr} className="py-2.5 text-center type-l6 text-[var(--text-muted)] font-medium">
                      <div>{d.dayName}</div>
                      <div className="text-[11px] text-[var(--text-muted)] tracking-normal">{d.shortDate}</div>
                    </th>
                  ))}
                  <th className="py-2.5 text-right type-l6 text-[var(--text-muted)] font-medium pl-4">本周 Touch</th>
                  {showDurationStats && (
                    <th className="py-2.5 text-right type-l6 text-[var(--text-muted)] font-medium pl-4">总时长</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--divider-subtle)]">
                {trackMatrix.map(({ track, touchedDays, touchCount, totalMinutes }) => (
                  <tr key={track.id} className="hover:bg-[var(--surface-panel)]/50 transition-colors">
                    <td className="py-3 font-medium text-[var(--text-primary)] flex items-center gap-2 type-l5">
                      <span className="truncate">{track.name}</span>
                      <span className="type-l6 text-[var(--text-muted)] font-sans font-medium">
                        {track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'}
                      </span>
                    </td>

                    {touchedDays.map((touched, idx) => (
                      <td key={idx} className="py-3 text-center">
                        {touched ? (
                          <div className="w-2 h-2 rounded-full bg-[var(--accent-brass)] mx-auto shadow-[0_0_3px_color-mix(in_srgb,var(--accent-brass)_30%,transparent)]" />
                        ) : (
                          <span className="text-[var(--text-ghost)] type-l5">·</span>
                        )}
                      </td>
                    ))}

                    <td className="py-3 text-right type-l5 font-mono text-[var(--text-muted)] pl-4 font-medium">
                      {touchCount > 0 ? (
                        <span className="text-[var(--text-primary)] font-medium">{touchCount} 次</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {showDurationStats && (
                      <td className="py-3 text-right type-l5 font-mono text-[var(--text-muted)] pl-4 font-medium">
                        {totalMinutes > 0
                          ? totalMinutes >= 60
                            ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                            : `${totalMinutes}m`
                          : '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Archive Logs */}
        <section className="archive-ledger-section pt-4">
          <header className="ledger-section-header border-b border-[var(--border-accent-subtle)] pb-2">
            <h2 className="section-title">
              本周日常记录存根
            </h2>
            <span className="type-l6 font-mono text-[var(--text-muted)] uppercase tracking-wider font-medium">
              DAILY ARCHIVE
            </span>
          </header>

          <div className="archive-ledger-body">
            {weekLogs.length === 0 && dayCloses.length === 0 && (
              <div className="ledger-section-body">
                <ChronographLedger
                  mode="archive"
                  entries={[]}
                  tracks={tracks}
                  emptyMessage="暂无记录"
                  emptySubtext="本周还没有留下日常记录。"
                />
              </div>
            )}

            {weekDays
              .slice()
              .reverse()
              .map(d => {
                const dayEntries = sortEntriesByStartedAt(weekLogs.filter(l => l.date === d.dateStr));
                const dayClose = dayCloses.find(dc => dc.date === d.dateStr);

                if (dayEntries.length === 0 && !dayClose) return null;

                return (
                  <div key={d.dateStr} className="archive-day-group">
                    {/* Date Section Header */}
                    <div className="archive-day-header">
                      <div className="archive-day-date">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)]" />
                        <span className="date-group-heading">
                          {d.dateStr} · {d.dayName}
                        </span>
                      </div>
                      <span className="type-l6 font-mono text-[var(--text-muted)] font-medium">
                        {dayEntries.length} 笔记录
                      </span>
                    </div>

                    {/* Timeline Archive Entries (Chronograph Ledger Archive Slip) */}
                    <div className="archive-day-ledger">
                      <ChronographLedger
                        mode="archive"
                        entries={dayEntries}
                        tracks={tracks}
                      />
                    </div>

                    {/* Day Close Reflection Note */}
                    {dayClose && (
                      <div className="ml-5 sm:ml-28 pl-4 py-2 border-l-2 border-[var(--border-accent)] type-l5 text-[var(--text-secondary)] italic space-y-1 font-sans bg-[var(--surface-panel-subtle)]/50 rounded-r my-2">
                        {dayClose.note && <div>💭 「{dayClose.note}」</div>}
                        {dayClose.carry_forward && (
                          <div className="text-[var(--accent-brass-hover)] not-italic font-medium">
                            ↳ 明天关注: {dayClose.carry_forward}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
};
