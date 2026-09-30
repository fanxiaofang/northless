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

  // Format duration into quiet instrument string without box/badge
  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes <= 0) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
  };

  // Duration tier: physical impression without turning into a bar chart
  // short: 24px, medium: 36px, long: 48px
  const getDurationTier = (durationMinutes?: number): 'short' | 'medium' | 'long' => {
    if (!durationMinutes || durationMinutes < 15) return 'short';
    if (durationMinutes <= 45) return 'medium';
    return 'long';
  };

  if (entries.length === 0 && !activeSession) {
    return (
      <div className="py-8 px-4 text-center space-y-2 max-w-[700px]">
        <div className="type-l6 font-mono text-[var(--text-ghost)] tracking-widest uppercase select-none">
          ···· NO RECORDS ····
        </div>
        <p className="type-l4 font-sans text-[var(--text-secondary)]">{emptyMessage}</p>
        <p className="type-l6 font-sans text-[var(--text-ghost)]">{emptySubtext}</p>
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

  const isArchive = mode === 'archive';
  const activeTrack = activeSession ? tracks.find(t => t.id === activeSession.track_id) : null;

  return (
    <div
      className={`relative max-w-[700px] w-full space-y-1 ${
        isArchive ? 'opacity-90' : ''
      }`}
      data-mode={mode}
    >
      {/* Active Session Live Marker (Grid Layout) */}
      {mode === 'live' && activeSession && (
        <div className="grid grid-cols-[68px_72px_minmax(0,1fr)_44px_24px] sm:grid-cols-[72px_76px_minmax(0,1fr)_46px_24px] items-start gap-2.5 sm:gap-3 py-1.5 px-2 -mx-2 rounded bg-white/[0.012]">
          {/* Timestamp Column */}
          <div className="w-full text-right type-l6 font-mono tabular-nums text-[#86a69a] select-none pt-0.5">
            <span className="inline-block animate-pulse">● LIVE</span>
          </div>

          {/* Lead-in Rail & Punch Node Column */}
          <div className="w-full flex items-center justify-end h-[22px]">
            <div className="rail-fade-in rail-active w-[36px]" />
            <div className="punch-node-active ml-1.5" />
          </div>

          {/* Content & Contextual Metadata */}
          <div className="min-w-0">
            <div className="font-sans font-medium text-[14px] sm:text-[14.5px] text-[var(--text-hero)] leading-[22px] break-words">
              {activeSession.task_title || '自由专注 Session'}
            </div>
            {activeTrack && (
              <div className="type-l6 font-sans text-[#86a69a]/90 flex items-center gap-1.5 mt-0.5">
                <span className="font-medium">{activeTrack.name}</span>
                <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                <span>正在进行中</span>
              </div>
            )}
          </div>

          {/* Elapsed Duration Indicator */}
          <div className="w-full text-right type-l6 font-mono text-[#86a69a] tabular-nums select-none pt-0.5">
            {Math.floor(activeSession.elapsed_seconds / 60)}m
          </div>

          {/* Action Column Slot (Blank for layout alignment) */}
          <div className="w-full h-full" />
        </div>
      )}

      {/* Ledger Log Rows */}
      {entries.map((log) => {
        // Orthogonal Modeling:
        // Dimension 1: Event Kind ('session' | 'note')
        const kind: 'session' | 'note' = log.type === 'session' ? 'session' : 'note';
        
        // Dimension 2: Track Association
        const track = tracks.find(t => t.id === log.track_id);
        const hasTrack = Boolean(track && log.track_id);

        const durationTier = getDurationTier(log.duration_minutes);
        const durationLabel = formatDuration(log.duration_minutes);
        const isHovered = hoveredLogId === log.id;

        // Physical rail width: short (24px), medium (36px), long (48px)
        const getRailWidthStyle = () => {
          if (durationTier === 'short') return 'w-[24px]';
          if (durationTier === 'medium') return 'w-[36px]';
          return 'w-[48px]';
        };

        return (
          <div
            key={log.id}
            onMouseEnter={() => setHoveredLogId(log.id)}
            onMouseLeave={() => setHoveredLogId(null)}
            className="group relative grid grid-cols-[68px_72px_minmax(0,1fr)_44px_24px] sm:grid-cols-[72px_76px_minmax(0,1fr)_46px_24px] items-start gap-2.5 sm:gap-3 py-1.5 px-2 -mx-2 rounded transition-colors hover:bg-white/[0.012]"
          >
            {/* 1. Time Column: Fixed width, start time default, full span on hover without layout jump */}
            <div className="w-full text-right type-l6 font-mono tabular-nums text-[var(--text-muted)] select-none pt-0.5 transition-colors group-hover:text-[var(--text-primary)]">
              {log.started_at ? (
                log.ended_at ? (
                  <>
                    <span className="hidden group-hover:inline text-[10.5px] tracking-tighter">
                      {log.started_at}→{log.ended_at}
                    </span>
                    <span className="inline group-hover:hidden">
                      {log.started_at}
                    </span>
                  </>
                ) : (
                  <span>{log.started_at}</span>
                )
              ) : (
                <span className="text-[var(--text-ghost)] tracking-widest font-normal">····</span>
              )}
            </div>

            {/* 2. Rail & Punch Node Column: Distinct Grammar per Event Category */}
            <div className="w-full flex items-center justify-end h-[22px]">
              {kind === 'session' ? (
                /* A. SESSION: Solid lead-in rail + Brass punch ring */
                <>
                  <div
                    className={`rail-fade-in ${
                      isArchive ? 'rail-archive' : 'rail-session'
                    } ${getRailWidthStyle()} transition-opacity duration-150 ${
                      isArchive
                        ? 'opacity-40 group-hover:opacity-60'
                        : 'opacity-75 group-hover:opacity-90'
                    }`}
                  />
                  <div
                    className={`${
                      isArchive ? 'punch-node-session-archive' : 'punch-node-session'
                    } ml-1.5`}
                  />
                </>
              ) : hasTrack ? (
                /* B. TRACK NOTE / TOUCH: Subtle green-gray lead-in rail + Diamond punch */
                <>
                  <div
                    className={`rail-fade-in ${
                      isArchive ? 'rail-archive' : 'rail-track'
                    } w-[24px] transition-opacity duration-150 ${
                      isArchive
                        ? 'opacity-35 group-hover:opacity-55'
                        : 'opacity-70 group-hover:opacity-85'
                    }`}
                  />
                  <div
                    className={`${
                      isArchive ? 'punch-node-track-archive' : 'punch-node-track'
                    } ml-1.5`}
                  />
                </>
              ) : (
                /* C. LIFE / FREE NOTE: Dotted tape ONLY (No node, no morse-code double mark) */
                <span className="font-mono text-[11px] text-[var(--text-ghost)] select-none opacity-60 group-hover:opacity-85 transition-opacity tracking-widest mr-1">
                  ····
                </span>
              )}
            </div>

            {/* 3. Event Content & Value-Add Metadata */}
            <div className="min-w-0">
              {/* Event Content Typography Separation:
                  Session / Track Note -> Sans 500 (Machine / Engineering Context)
                  Life Note -> LXGW WenKai 400 (Human Reality Note)
              */}
              {kind === 'session' || hasTrack ? (
                <div
                  className={`font-sans font-medium text-[14px] sm:text-[14.5px] leading-[22px] break-words transition-colors ${
                    isArchive
                      ? 'text-[var(--text-primary)]/90 group-hover:text-[var(--text-hero)]'
                      : 'text-[var(--text-primary)] group-hover:text-[var(--text-hero)]'
                  }`}
                >
                  {log.content}
                </div>
              ) : (
                <div
                  className={`font-journal text-[15px] leading-[22px] font-normal break-words transition-colors ${
                    isArchive
                      ? 'text-[var(--text-secondary)]/90 group-hover:text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                  }`}
                >
                  {log.content}
                </div>
              )}

              {/* Subordinate Contextual Metadata:
                  Only render when it genuinely adds context (Track name + role).
                  Do NOT render redundant "自由专注" or "生活随笔" labels.
              */}
              {hasTrack && track && (
                <div className="type-l6 font-sans text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                  <span className={`${isArchive ? 'text-[#a6824b]' : 'text-[#b38a48]'} font-medium`}>
                    {track.name}
                  </span>
                  <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                  <span>
                    {track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Duration Column: Instrument reading directly adjacent to content */}
            <div className="w-full text-right type-l6 font-mono tabular-nums text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors select-none pt-0.5">
              {durationLabel || ''}
            </div>

            {/* 5. Action Column: Quiet delete affordance on hover */}
            <div className="w-full flex items-center justify-center pt-0.5">
              {onDeleteLog && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLog(log.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-[var(--text-muted)] hover:text-[#e06c75] cursor-pointer"
                  title="删除记录"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
