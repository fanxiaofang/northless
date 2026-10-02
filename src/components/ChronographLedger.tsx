import React from 'react';
import { Trash2 } from 'lucide-react';
import { ActiveSession, LogEntry, Track } from '../types';
import { InlineEmptyState } from './InlineEmptyState';
import { CockpitConfirmAction } from './ui/CockpitConfirmAction';
import { CockpitTooltip } from './ui/CockpitTooltip';

export type LedgerMode = 'live' | 'archive';

interface ChronographLedgerProps {
  entries: LogEntry[];
  tracks: Track[];
  mode?: LedgerMode;
  activeSession?: ActiveSession | null;
  onDeleteLog?: (logId: string) => void;
  emptyMessage?: string;
  emptySubtext?: string;
}

export const ChronographLedger: React.FC<ChronographLedgerProps> = ({
  entries,
  tracks,
  mode = 'live',
  activeSession,
  onDeleteLog,
  emptyMessage = '暂无记录存根',
  emptySubtext = '发生的现实由人亲手留下。',
}) => {
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
  // short: 22px, medium: 34px, long: 46px
  const getDurationTier = (durationMinutes?: number): 'short' | 'medium' | 'long' => {
    if (!durationMinutes || durationMinutes < 15) return 'short';
    if (durationMinutes <= 45) return 'medium';
    return 'long';
  };

  const isArchive = mode === 'archive';
  const isEmpty = entries.length === 0 && !activeSession;
  const activeTrack = activeSession ? tracks.find(t => t.id === activeSession.track_id) : null;

  return (
    <div className="relative max-w-[640px] w-full space-y-1" data-mode={mode}>
      {isEmpty && (
        <div className="ledger-grid ledger-empty-row" role="status">
          <span className="ledger-empty-rail" aria-hidden="true">····</span>
          <InlineEmptyState
            className="ledger-empty-block"
            label={emptyMessage}
            description={emptySubtext}
          />
        </div>
      )}

      {/* Active Session Live Marker (Grid Layout tightened) */}
      {mode === 'live' && activeSession && (
        <div className="ledger-grid rounded bg-white/[0.012]">
          {/* Timestamp Column */}
          <div className="w-full text-right ledger-time text-[#78998d] select-none pt-0.5">
            <span className="inline-block animate-pulse">● LIVE</span>
          </div>

          {/* Lead-in Rail & Punch Node Column */}
          <div className="w-full flex items-center justify-end h-[22px]">
            <div className="rail-fade-in rail-active w-[34px]" />
            <div className="punch-node-active ml-1.5" />
          </div>

          {/* Content & Contextual Metadata */}
          <div className="min-w-0">
            <div className="ledger-event-title">
              {activeSession.task_title || '自由专注'}
            </div>
            {activeTrack && (
              <div className="ledger-event-meta flex items-center gap-1.5 mt-0.5">
                <span className="ledger-event-track">{activeTrack.name}</span>
                <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                <span className="text-[var(--text-muted)]">正在进行中</span>
              </div>
            )}
          </div>

          {/* Elapsed Duration Indicator */}
          <div className="w-full text-right ledger-duration text-[#78998d] select-none pt-0.5">
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
        
        // Dimension 2: Track Association & Completion state
        const track = tracks.find(t => t.id === log.track_id);
        const hasTrack = Boolean(track && log.track_id);
        const isCompletion =
          log.content.startsWith('完成:') ||
          log.content.startsWith('完成：') ||
          log.content.startsWith('完成 ');
        const isSession = kind === 'session' && !isCompletion;

        const durationTier = getDurationTier(log.duration_minutes);
        const durationLabel = formatDuration(log.duration_minutes);

        // Physical rail width: short (22px), medium (34px), long (46px)
        const getRailWidthStyle = () => {
          if (durationTier === 'short') return 'w-[22px]';
          if (durationTier === 'medium') return 'w-[34px]';
          return 'w-[46px]';
        };

        return (
          <div
            key={log.id}
            className="ledger-grid group relative transition-colors hover:bg-white/[0.015]"
          >
            {/* 1. Time Column: Fixed width, start time default, full span on hover without layout jump */}
            <div className="w-full text-right ledger-time select-none pt-0.5 transition-colors group-hover:text-[var(--text-primary)]">
              {log.started_at ? (
                log.ended_at ? (
                  <>
                    <span className="hidden group-hover:inline text-[11px] tracking-tight font-medium">
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
              {isSession ? (
                /* A. SESSION: Solid lead-in rail + Brass punch ring */
                <CockpitTooltip content="专注 Session">
                  <span role="img" aria-label="专注 Session" className="inline-flex items-center">
                    <div
                      className={`rail-fade-in ${
                        isArchive ? 'rail-archive' : 'rail-session'
                      } ${getRailWidthStyle()} transition-opacity duration-150`}
                      aria-hidden="true"
                    />
                    <div
                      className={`${
                        isArchive ? 'punch-node-session-archive' : 'punch-node-session'
                      } ml-1.5`}
                      aria-hidden="true"
                    />
                  </span>
                </CockpitTooltip>
              ) : isCompletion || hasTrack ? (
                /* B. COMPLETION / TRACK NOTE: Lighter & shorter ─◇ (diamond punch) */
                <CockpitTooltip content="推进记录 · 完成或主线关联">
                  <span role="img" aria-label="推进记录 · 完成或主线关联" className="inline-flex items-center">
                    <div
                      className={`rail-fade-in ${
                        isArchive ? 'rail-archive' : 'rail-track'
                      } w-[18px] sm:w-[20px] transition-opacity duration-150`}
                      aria-hidden="true"
                    />
                    <div
                      className={`${
                        isArchive ? 'punch-node-track-archive' : 'punch-node-track'
                      } ml-1.5`}
                      aria-hidden="true"
                    />
                  </span>
                </CockpitTooltip>
              ) : (
                /* C. LIFE / FREE NOTE: Dotted tape ONLY (No node, no morse-code double mark) */
                <CockpitTooltip content="自由记录 · 未关联主线">
                  <span
                    role="img"
                    aria-label="自由记录 · 未关联主线"
                    className="font-mono text-[11px] text-[var(--text-ghost)] select-none tracking-widest mr-1 font-normal"
                  >
                    <span aria-hidden="true">····</span>
                  </span>
                </CockpitTooltip>
              )}
            </div>

            {/* 3. Event Content & Value-Add Metadata */}
            <div className="min-w-0">
              {/* Every lived event uses one journal voice. Type differences stay in rail/node/meta. */}
              <div className="ledger-event-title">
                {log.content}
              </div>

              {/* Subordinate Contextual Metadata:
                  Render when it adds context (Track name + role).
                  Clear Brass + Muted tokens without muddy opacity stacks.
              */}
              {hasTrack && track && (
                <div className="ledger-event-meta flex items-center gap-1.5 mt-0.5">
                  <span
                    className="ledger-event-track group-hover:text-[#c89a5a] transition-colors"
                  >
                    {track.name}
                  </span>
                  <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                  <span
                    className="text-[var(--text-muted)]"
                  >
                    {track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'}
                  </span>
                </div>
              )}
            </div>

            {/* 4. Duration Column: Instrument reading directly adjacent to content */}
            <div
              className="w-full text-right ledger-duration select-none pt-0.5 transition-colors group-hover:text-[var(--text-primary)]"
            >
              {durationLabel || ''}
            </div>

            {/* 5. Action Column: Quiet delete affordance on hover */}
            <div className="w-full flex items-center justify-center pt-0.5">
              {onDeleteLog && (
                <CockpitConfirmAction tooltip="删除记录" title="删除这条记录？" description="这条时间线记录将被永久移除。" onConfirm={() => onDeleteLog(log.id)}>{({ ref, onClick, expanded }) => <button
                  ref={ref}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-[var(--text-muted)] hover:text-[#e06c75] cursor-pointer"
                  aria-label="删除记录"
                  aria-expanded={expanded}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>}</CockpitConfirmAction>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
