import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { ActiveSession, LogEntry, Track } from '../types';

export type LedgerMode = 'live' | 'archive';

interface ChronographLedgerProps {
  entries: LogEntry[];
  tracks: Track[];
  mode?: LedgerMode;
  activeSession?: ActiveSession | null;
  onDeleteLog?: (logId: string) => void;
  emptyMessage?: string;
  emptySubtext?: string;
  onOpenCreate?: () => void;
}

export const ChronographLedger: React.FC<ChronographLedgerProps> = ({
  entries,
  tracks,
  mode = 'live',
  activeSession,
  onDeleteLog,
  emptyMessage = '暂无记录存根',
  emptySubtext = '发生的现实由人亲手留下。',
  onOpenCreate,
}) => {
  const [hoveredLogId, setHoveredLogId] = useState<string | null>(null);

  // Format duration into quiet instrument string without box
  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes <= 0) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
  };

  // Determine duration tier for the physical rail length
  const getDurationTier = (durationMinutes?: number): 'short' | 'medium' | 'long' => {
    if (!durationMinutes || durationMinutes < 15) return 'short';
    if (durationMinutes <= 45) return 'medium';
    return 'long';
  };

  // Resolve event visual category
  const getEventCategory = (
    log: LogEntry,
    track?: Track
  ): 'session' | 'track_touch' | 'life_note' => {
    if (log.type === 'session') {
      return track ? 'track_touch' : 'session';
    }
    // note
    return track ? 'track_touch' : 'life_note';
  };

  if (entries.length === 0 && !activeSession) {
    return (
      <div className="py-8 px-6 text-center space-y-2">
        <div className="type-l6 font-mono text-[var(--text-ghost)] tracking-widest uppercase select-none">
          ···· NO RECORDS ····
        </div>
        <p className="type-journal text-[var(--text-muted)] text-[15px]">{emptyMessage}</p>
        <p className="type-l6 text-[var(--text-ghost)] font-sans">{emptySubtext}</p>
        {onOpenCreate && (
          <button
            onClick={onOpenCreate}
            className="brass-button px-3.5 py-1.5 rounded type-l5 text-[var(--text-hero)] inline-flex items-center gap-1.5 cursor-pointer mt-2"
          >
            <span>留下第一笔记录</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative space-y-1 ${
        mode === 'archive' ? 'opacity-95' : ''
      }`}
      data-mode={mode}
    >
      {/* Active Session Live Marker (If running session is passed into live chronograph) */}
      {mode === 'live' && activeSession && (
        <div className="group relative flex items-center gap-3 sm:gap-4 py-2 px-2 -mx-2 rounded transition-colors bg-white/[0.012]">
          {/* Timestamp column */}
          <div className="w-14 sm:w-20 text-right shrink-0 type-l6 font-mono tabular-nums text-[#86a69a] select-none">
            <span className="inline-block animate-pulse">● LIVE</span>
          </div>

          {/* Lead-in Rail & Node */}
          <div className="flex items-center justify-end w-16 sm:w-20 shrink-0">
            <div className="flex items-center justify-end w-full">
              <div className="rail-fade-in rail-active w-12 sm:w-16 transition-all" />
              <div className="punch-node-active ml-1.5" />
            </div>
          </div>

          {/* Content & Metadata */}
          <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
              <div className="type-journal text-[var(--text-hero)] leading-relaxed break-words">
                {activeSession.task_title || '自由专注 Session'}
              </div>
              <div className="type-l6 font-sans text-[#86a69a]/80 flex items-center gap-1.5">
                <span>{tracks.find(t => t.id === activeSession.track_id)?.name || '自由专注'}</span>
                <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                <span>正在进行中</span>
              </div>
            </div>

            {/* Elapsed minutes indicator */}
            <div className="shrink-0 type-l6 font-mono text-[#86a69a] tabular-nums">
              {Math.floor(activeSession.elapsed_seconds / 60)}m
            </div>
          </div>
        </div>
      )}

      {/* Log Entries */}
      {entries.map((log) => {
        const track = tracks.find(t => t.id === log.track_id);
        const category = getEventCategory(log, track);
        const durationTier = getDurationTier(log.duration_minutes);
        const isHovered = hoveredLogId === log.id;
        const durationLabel = formatDuration(log.duration_minutes);

        // Rail width based on duration tier
        const getRailWidthClass = () => {
          if (durationTier === 'short') return 'w-6 sm:w-8';
          if (durationTier === 'medium') return 'w-10 sm:w-14';
          return 'w-14 sm:w-20';
        };

        return (
          <div
            key={log.id}
            onMouseEnter={() => setHoveredLogId(log.id)}
            onMouseLeave={() => setHoveredLogId(null)}
            className={`group relative flex items-center gap-3 sm:gap-4 py-2 px-2 -mx-2 rounded transition-colors ${
              isHovered ? 'bg-white/[0.016]' : 'bg-transparent'
            }`}
          >
            {/* Timestamp Column: Default start time, hover reveals full span */}
            <div className="w-14 sm:w-20 text-right shrink-0 type-l6 font-mono tabular-nums text-[var(--text-muted)] select-none transition-colors group-hover:text-[var(--text-primary)]">
              {log.started_at ? (
                isHovered && log.ended_at ? (
                  <span className="text-[11px] tracking-tight">
                    {log.started_at}→{log.ended_at}
                  </span>
                ) : (
                  <span>{log.started_at}</span>
                )
              ) : (
                <span className="text-[var(--text-ghost)] tracking-widest font-normal">····</span>
              )}
            </div>

            {/* Lead-in Rail & Punch Node Column */}
            <div className="flex items-center justify-end w-16 sm:w-20 shrink-0">
              <div className="flex items-center justify-end w-full">
                {/* Visual Lead-in Rail */}
                {category === 'life_note' ? (
                  <div className="flex items-center gap-1 text-[var(--text-ghost)] opacity-60 group-hover:opacity-100 transition-opacity pr-1 select-none type-l6">
                    <span>···</span>
                  </div>
                ) : (
                  <div
                    className={`rail-fade-in ${
                      mode === 'archive'
                        ? 'rail-archive'
                        : category === 'track_touch'
                        ? 'rail-track'
                        : 'rail-session'
                    } ${getRailWidthClass()} transition-all duration-200 group-hover:opacity-100 opacity-80`}
                  />
                )}

                {/* Mechanical Punch Mark Node */}
                <div
                  className={`transition-transform duration-150 ${
                    isHovered ? 'scale-115' : 'scale-100'
                  } ${
                    mode === 'archive'
                      ? category === 'track_touch'
                        ? 'punch-node-track-archive ml-1.5'
                        : category === 'session'
                        ? 'punch-node-session-archive ml-1.5'
                        : 'punch-node-life-archive ml-1'
                      : category === 'track_touch'
                      ? 'punch-node-track ml-1.5'
                      : category === 'session'
                      ? 'punch-node-session ml-1.5'
                      : 'punch-node-life ml-1'
                  }`}
                />
              </div>
            </div>

            {/* Event Content & Clean Unboxed Metadata */}
            <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                {/* Journal Handwriting Entry */}
                <div className="type-journal text-[var(--text-primary)] group-hover:text-[var(--text-hero)] transition-colors leading-relaxed break-words">
                  {log.content}
                </div>

                {/* Subordinate Clean Metadata (No chips, no pills, no brackets) */}
                <div className="type-l6 font-sans text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1.5 flex-wrap">
                  {track ? (
                    <>
                      <span className="text-[#b38a48] font-medium">{track.name}</span>
                      <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                      <span>{track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'}</span>
                    </>
                  ) : log.type === 'session' ? (
                    <span>自由专注</span>
                  ) : (
                    <span>生活随笔</span>
                  )}
                </div>
              </div>

              {/* Rightmost: Duration & Action Affordances */}
              <div className="flex items-center gap-2.5 shrink-0 self-center sm:self-baseline">
                {durationLabel && (
                  <span className="type-l6 font-mono text-[var(--text-muted)] group-hover:text-[var(--text-primary)] tabular-nums transition-colors">
                    {durationLabel}
                  </span>
                )}

                {onDeleteLog && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLog(log.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--text-muted)] hover:text-[#e06c75] cursor-pointer"
                    title="删除记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
