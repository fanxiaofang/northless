import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StageTrajectoryData, formatCompactDate, formatDurationHoursMins } from '../lib/trajectory';

interface TrackEpochStrataProps {
  stages: StageTrajectoryData[];
}

export const TrackEpochStrata: React.FC<TrackEpochStrataProps> = ({ stages }) => {
  const [isAllExpanded, setIsAllExpanded] = useState<boolean>(true);

  return (
    <div className="space-y-3 pt-1">
      {/* Subheader */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono pb-1">
        <span>纪元档案：从创建至今日的实际演进切片</span>
        <button
          type="button"
          onClick={() => setIsAllExpanded(!isAllExpanded)}
          className="cockpit-action-text cursor-pointer text-xs flex items-center gap-1 hover:text-[var(--text-primary)]"
        >
          <span>{isAllExpanded ? '收起全部明细' : '展开全部明细'}</span>
          {isAllExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Epoch Cards */}
      <div className="space-y-3">
        {stages.map((st, idx) => {
          const isCompleted = st.state === 'completed';
          const isCurrent = st.state === 'current';
          const isFuture = st.state === 'future';

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border transition-colors ${
                isCurrent
                  ? 'border-[var(--accent-brass)] bg-[var(--surface-selected)]/40 shadow-sm'
                  : isCompleted
                  ? 'border-[var(--border-success)] bg-[var(--surface-panel)]/50'
                  : 'border-[var(--border-subtle)] bg-[var(--surface-recessed)]/20 border-dashed opacity-75'
              }`}
            >
              {/* Epoch Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[var(--divider-subtle)]">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs px-2 py-0.5 rounded font-semibold tracking-wider ${
                      isCompleted
                        ? 'bg-[var(--surface-success)] text-[var(--accent-verdigris)] border border-[var(--border-success)]'
                        : isCurrent
                        ? 'bg-[var(--accent-brass)]/20 text-[var(--accent-brass)] border border-[var(--accent-brass)]/40'
                        : 'bg-transparent text-[var(--text-ghost)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    EPOCH {String(idx + 1).padStart(2, '0')}
                  </span>
                  <h4 className="font-display font-medium text-sm text-[var(--text-title)]">
                    {st.stageName}
                  </h4>
                  {isCurrent && (
                    <span className="text-[11.5px] font-mono text-[var(--accent-brass)] font-semibold">
                      [当前攻坚]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                  {isFuture ? (
                    <span className="text-[var(--text-ghost)]">远期规划</span>
                  ) : (
                    <>
                      <span>{st.dateRange}</span>
                      <span className="text-[var(--text-ghost)]" aria-hidden="true">·</span>
                      <span>{st.touchCount}次推进</span>
                      <span className="text-[var(--text-ghost)]" aria-hidden="true">·</span>
                      <span className="text-[var(--text-secondary)] font-medium">
                        {formatDurationHoursMins(st.totalMinutes)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Epoch Content */}
              <div className="pt-2 text-xs space-y-2.5">
                {isFuture ? (
                  <p className="text-[var(--text-ghost)] italic py-1">
                    剩余路线规划刻度，攻坚至此时启动。
                  </p>
                ) : (
                  <>
                    {/* Milestones / Key Accomplishments */}
                    {st.keyMilestones.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">突破与完成项：</span>
                        <div className="flex flex-wrap gap-1.5">
                          {st.keyMilestones.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className={`px-2 py-1 rounded text-[11.5px] border ${
                                isCompleted
                                  ? 'bg-[var(--surface-recessed)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                                  : 'bg-[var(--surface-selected)] text-[var(--text-primary)] border-[var(--accent-brass)]/30'
                              }`}
                            >
                              ✓ {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Record Stubs */}
                    {isAllExpanded && st.logs.length > 0 && (
                      <div className="pt-2 space-y-1.5 border-t border-[var(--divider-subtle)]">
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">期间记录存根：</span>
                        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                          {st.logs.map(l => (
                            <div
                              key={l.id}
                              className="flex items-center justify-between py-1.5 px-2 rounded bg-[var(--surface-canvas)]/40 hover:bg-[var(--surface-canvas)]/70 text-[var(--text-secondary)] text-[12px] transition-colors"
                            >
                              <span className="font-mono text-[11px] text-[var(--text-muted)] shrink-0 pr-2.5 font-medium">
                                {formatCompactDate(l.date)}
                              </span>
                              <span className="truncate flex-1 font-[450]">{l.content}</span>
                              {l.duration_minutes ? (
                                <span className="font-mono text-[11px] shrink-0 pl-2 text-[var(--text-muted)] font-medium">
                                  {l.duration_minutes}m
                                </span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
