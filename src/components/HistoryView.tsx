import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DayClose, LogEntry, Track } from '../types';

interface HistoryViewProps {
  tracks: Track[];
  logs: LogEntry[];
  dayCloses: DayClose[];
  currentDateStr: string;
}

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
  // For each track, check which of the 7 days has at least 1 log
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
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[#e6ddd0] p-6 lg:p-10">
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#c69956]/20 gap-4">
          <div>
            <div className="flex items-center gap-2 type-l6 font-mono text-[#82776b] tracking-wider uppercase mb-1">
              <span>TRAJECTORY / 轨迹，不是成绩单</span>
            </div>
            <h1 className="type-l1 font-display font-bold text-[#f7f0e5] flex items-baseline gap-2.5">
              <span>历史轨迹</span>
              <span className="type-l6 font-mono font-normal text-[#82776b] tracking-widest">/ ARCHIVE</span>
            </h1>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-2 bg-[#181512] px-3 py-1.5 rounded-lg border border-[#c69956]/25 self-start sm:self-auto">
            <button
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1 text-[#8a7f72] hover:text-[#dfbf85] transition-colors"
              title="上一周"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="type-l6 font-medium text-[#ded7cd] px-2">
              {weekDays[0].shortDate} ─ {weekDays[6].shortDate}
              {weekOffset === 0 && <span className="text-[#c69956] ml-1.5">(本周)</span>}
            </span>

            <button
              onClick={() => setWeekOffset(prev => prev + 1)}
              disabled={weekOffset >= 0}
              className={`p-1 transition-colors ${
                weekOffset >= 0 ? 'text-[#3d362d] cursor-not-allowed' : 'text-[#8a7f72] hover:text-[#dfbf85]'
              }`}
              title="下一周"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Weekly Touch Matrix (The core visual - Dedicated warm ambient micro-glow) */}
        <div className="matrix-panel p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="type-l3 font-bold text-[#f7f2ea] flex items-center gap-2">
                <span>周主线触达矩阵</span>
              </h2>
              <p className="type-l6 text-[#9c9183] font-sans mt-0.5">
                看见哪条主线在这周移动了，没有红黄绿考核，没有打卡焦虑
              </p>
            </div>

            <button
              onClick={() => setShowDurationStats(prev => !prev)}
              className="type-l5 text-[#8a7f72] hover:text-[#dfbf85] flex items-center gap-1 transition-colors"
            >
              <span>{showDurationStats ? '隐藏时间明细' : '查看投入时间'}</span>
              {showDurationStats ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Matrix Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#c69956]/20">
                  <th className="py-2.5 type-l5 font-display text-[#9c9183] font-normal w-40">主线</th>
                  {weekDays.map(d => (
                    <th key={d.dateStr} className="py-2.5 text-center type-l6 text-[#9c9183] font-normal">
                      <div>{d.dayName}</div>
                      <div className="text-[10px] text-[#635748] tracking-normal">{d.shortDate}</div>
                    </th>
                  ))}
                  <th className="py-2.5 text-right type-l6 text-[#9c9183] font-normal pl-4">本周 Touch</th>
                  {showDurationStats && (
                    <th className="py-2.5 text-right type-l6 text-[#c69956] font-normal pl-4">总时长</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c69956]/10">
                {trackMatrix.map(({ track, touchedDays, touchCount, totalMinutes }) => (
                  <tr key={track.id} className="hover:bg-[#181512]/50 transition-colors">
                    <td className="py-3 font-medium text-[#f2ede4] flex items-center gap-2 type-l5">
                      <span className="truncate">{track.name}</span>
                      <span className="type-l6 text-[#8a7f72] font-sans">
                        {track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'}
                      </span>
                    </td>

                    {touchedDays.map((touched, idx) => (
                      <td key={idx} className="py-3 text-center">
                        {touched ? (
                          <div className="w-2 h-2 rounded-full bg-[#ba9258] mx-auto shadow-[0_0_4px_rgba(198,153,86,0.22)]" />
                        ) : (
                          <span className="text-[#473d32] type-l5">·</span>
                        )}
                      </td>
                    ))}

                    <td className="py-3 text-right type-l6 text-[#a89b8a] pl-4">
                      {touchCount > 0 ? (
                        <span className="text-[#ded7cd] font-medium">{touchCount} 次</span>
                      ) : (
                        <span className="text-[#5e5344]">—</span>
                      )}
                    </td>

                    {showDurationStats && (
                      <td className="py-3 text-right type-l6 text-[#c69956] pl-4">
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
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#c69956]/20 pb-2">
            <h2 className="type-l3 font-bold text-[#f7f2ea]">
              本周日常记录存根
            </h2>
            <span className="type-l6 font-mono text-[#8a7f72] uppercase tracking-wider">
              DAILY ARCHIVE · 工程日志
            </span>
          </div>

          <div className="space-y-8">
            {weekDays
              .slice()
              .reverse()
              .map(d => {
                const dayEntries = weekLogs.filter(l => l.date === d.dateStr);
                const dayClose = dayCloses.find(dc => dc.date === d.dateStr);

                if (dayEntries.length === 0 && !dayClose) return null;

                return (
                  <div key={d.dateStr} className="space-y-2">
                    {/* Date Section Header - Engineering Journal Style */}
                    <div className="flex items-center justify-between border-b border-[#c69956]/15 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a6824b]" />
                        <span className="type-l4 font-bold text-[#f5f1ea] font-display">
                          {d.dateStr} · {d.dayName}
                        </span>
                      </div>
                      <span className="type-l6 font-mono text-[#8a7f72]">
                        {dayEntries.length} 笔记录
                      </span>
                    </div>

                    {/* Timeline Rail Entries (Zero Boxitis, pure typography & precision rail) */}
                    <div className="space-y-0">
                      {dayEntries.map((entry, idx) => {
                        const track = tracks.find(t => t.id === entry.track_id);
                        const isSession = entry.type === 'session';
                        const isFirst = idx === 0;
                        const isLast = idx === dayEntries.length - 1 && !dayClose;

                        return (
                          <div key={entry.id} className="relative flex items-stretch gap-3 sm:gap-4 group">
                            {/* Left Column: Timestamp */}
                            <div className="w-16 sm:w-24 text-right shrink-0 type-l6 font-mono text-[#82776b] select-none pt-2">
                              {entry.started_at ? (
                                <span>
                                  {entry.started_at}
                                  {entry.ended_at && (
                                    <span className="hidden sm:inline text-[#5f574e]"> ─ {entry.ended_at}</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-[#473e34] tracking-widest">····</span>
                              )}
                            </div>

                            {/* Center Column: Vertical Rail & Precision Node */}
                            <div className="relative flex flex-col items-center shrink-0 w-4">
                              <div className={`w-[1px] flex-1 ${isFirst ? 'bg-transparent' : 'bg-[#c69956]/20'}`} />
                              <div
                                className={`w-2 h-2 rounded-full border shrink-0 my-1 transition-transform group-hover:scale-125 ${
                                  isSession
                                    ? 'border-[#8f6e3c] bg-[#ba9258] shadow-[0_0_3.5px_rgba(198,153,86,0.20)]'
                                    : 'border-[#4a4239] bg-[#141210]'
                                }`}
                              />
                              <div className={`w-[1px] flex-1 ${isLast ? 'bg-transparent' : 'bg-[#c69956]/20'}`} />
                            </div>

                            {/* Right Column: Content */}
                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#c69956]/10 py-2 group-hover:border-[#c69956]/25 transition-colors">
                              <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                                <span
                                  className={`type-l5 shrink-0 ${
                                    track ? 'text-[#d4ab6a] font-medium' : 'text-[#5f574e] font-normal'
                                  }`}
                                >
                                  [{track ? track.name : '生活'}]
                                </span>
                                <span className="type-l4 text-[#e6ddd0] leading-relaxed break-words">
                                  {entry.content}
                                </span>
                              </div>

                              {entry.duration_minutes && (
                                <span className="type-l6 font-mono text-[#82776b] bg-[#161412] px-1.5 py-0.5 rounded border border-[#2e271f] shrink-0 self-end sm:self-auto">
                                  {entry.duration_minutes >= 60
                                    ? `${Math.floor(entry.duration_minutes / 60)}h ${
                                        entry.duration_minutes % 60 > 0 ? `${entry.duration_minutes % 60}m` : ''
                                      }`
                                    : `${entry.duration_minutes}m`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Day Close Reflection Note */}
                    {dayClose && (
                      <div className="ml-5 sm:ml-28 pl-4 py-2 border-l-2 border-[#c69956]/40 type-l5 text-[#b8ada0] italic space-y-1 font-sans bg-[#161412]/40 rounded-r my-2">
                        {dayClose.note && <div>💭 「{dayClose.note}」</div>}
                        {dayClose.carry_forward && (
                          <div className="text-[#dfbf85] not-italic">
                            ↳ 明天关注: {dayClose.carry_forward}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
