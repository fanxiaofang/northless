import React, { useState } from 'react';
import {
  Check,
  Compass,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight
} from 'lucide-react';
import { LogEntry, NextAction, Track } from '../types';
import {
  calculateTrackTrajectory,
  formatCompactDate,
  formatDurationHoursMins,
  StageTrajectoryData,
} from '../lib/trajectory';
import { CockpitTooltip } from './ui/CockpitTooltip';

interface TrackTrajectoryProps {
  track: Track;
  logs: LogEntry[];
  actions: NextAction[];
  currentDateStr: string;
  onUpdateTrackStage: (trackId: string, stageIndex: number) => void;
  onStartSession?: (trackId: string, actionId?: string, title?: string) => void;
}

export const TrackTrajectory: React.FC<TrackTrajectoryProps> = ({
  track,
  logs,
  actions,
  currentDateStr,
  onUpdateTrackStage,
  onStartSession,
}) => {
  const [activeTab, setActiveTab] = useState<'rail' | 'epochs'>('rail');
  const [selectedInspectIndex, setSelectedInspectIndex] = useState<number>(track.current_stage_index);
  const [isEpochsExpanded, setIsEpochsExpanded] = useState<boolean>(false);

  const overview = calculateTrackTrajectory(track, logs, actions, currentDateStr);

  const inspectedStage: StageTrajectoryData | undefined =
    overview.stages[selectedInspectIndex] || overview.stages[track.current_stage_index];

  return (
    <section className="track-trajectory-panel space-y-4 pt-1" aria-label="全局航迹与路线刻度">
      {/* 1. Header HUD Instrument Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-[var(--border-accent-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="track-section-label flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[var(--accent-brass)]" aria-hidden="true" />
              <span>TRAJECTORY & HORIZON / 全局航迹与规划</span>
            </span>
          </div>
          {/* Macro Readings (Unboxed text with typographic separators) */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[var(--text-muted)] mt-1 font-mono">
            <span>
              起程 <strong className="text-[var(--text-secondary)] font-medium">{formatCompactDate(overview.createdDateStr)}</strong> ({overview.daysSinceCreation}天)
            </span>
            <span className="text-[var(--text-ghost)]" aria-hidden="true">·</span>
            <span>
              沉淀 <strong className="text-[var(--text-secondary)] font-medium">{overview.totalTouches}次</strong> / {formatDurationHoursMins(overview.totalMinutes)}
            </span>
            <span className="text-[var(--text-ghost)]" aria-hidden="true">·</span>
            <span>
              驻留 <strong className="text-[var(--accent-brass)] font-medium">{String(overview.completedStageCount + 1).padStart(2, '0')}/{String(overview.totalStageCount).padStart(2, '0')}</strong> 站
            </span>
            {overview.remainingStageCount > 0 && (
              <>
                <span className="text-[var(--text-ghost)]" aria-hidden="true">·</span>
                <span>
                  前瞻 <strong className="text-[var(--text-secondary)] font-medium">{overview.remainingStageCount}个刻度</strong>
                </span>
              </>
            )}
          </div>
        </div>

        {/* View mode toggle: Rail vs Epoch Strata */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="segmented-control compact" role="group" aria-label="航迹视图切换">
            <button
              type="button"
              onClick={() => setActiveTab('rail')}
              className={`segmented-item cursor-pointer text-xs ${activeTab === 'rail' ? 'is-selected' : ''}`}
              aria-pressed={activeTab === 'rail'}
            >
              <span>干线拓扑</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('epochs')}
              className={`segmented-item cursor-pointer text-xs ${activeTab === 'epochs' ? 'is-selected' : ''}`}
              aria-pressed={activeTab === 'epochs'}
            >
              <Layers className="w-3 h-3 mr-1 inline" aria-hidden="true" />
              <span>纪元沉淀</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main View Mode Content */}
      {activeTab === 'rail' ? (
        <div className="space-y-4">
          {/* Transit Rail Container */}
          <div className="relative py-2 px-1">
            {/* Guide hint */}
            <div className="flex items-center justify-between text-[11px] text-[var(--text-ghost)] font-mono pb-2">
              <span>← 已开通实测航轨 (真实沉淀)</span>
              <span>前瞻待达刻度 (剩余规划) →</span>
            </div>

            {/* Metro Transit Line */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
              {overview.stages.map((st, idx) => {
                const isSelected = selectedInspectIndex === idx;
                const isCompleted = st.state === 'completed';
                const isCurrent = st.state === 'current';
                const isFuture = st.state === 'future';

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedInspectIndex(idx);
                      onUpdateTrackStage(track.id, idx);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedInspectIndex(idx);
                        onUpdateTrackStage(track.id, idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`节点 ${idx + 1}: ${st.stageName} (${isCompleted ? '已完成' : isCurrent ? '当前位置' : '未来刻度'})`}
                    className={`transit-node-card group relative p-3 rounded-lg border transition-all cursor-pointer text-left ${
                      isCurrent
                        ? 'border-[var(--accent-brass)] bg-[var(--surface-selected)]/60 shadow-sm'
                        : isCompleted
                        ? 'border-[var(--border-success)] bg-[var(--surface-panel)]/40 hover:border-[var(--accent-verdigris)]'
                        : 'border-[var(--border-subtle)] bg-[var(--surface-recessed)]/30 border-dashed hover:border-[var(--border-default)] opacity-75'
                    } ${isSelected ? 'ring-1 ring-[var(--accent-brass)]/40' : ''}`}
                  >
                    {/* Top Station Badge & Connector Indicator */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Transit Socket Circle */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                            isCompleted
                              ? 'bg-[var(--surface-success)] border-[var(--accent-verdigris)] text-[var(--accent-verdigris)]'
                              : isCurrent
                              ? 'bg-[var(--accent-brass)]/20 border-[var(--accent-brass)] text-[var(--accent-brass)] shadow-[0_0_8px_rgba(184,137,79,0.35)]'
                              : 'bg-transparent border-[var(--border-rail-idle)] text-[var(--text-ghost)]'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-[var(--accent-brass)] animate-pulse" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-ghost)] opacity-50" />
                          )}
                        </div>

                        {/* Station Number & State Label */}
                        <span className="font-mono text-xs font-medium text-[var(--text-muted)]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* State Pill / Badge (Semantic text, no candy pill) */}
                      <span className="text-[11px] font-mono">
                        {isCompleted ? (
                          <span className="text-[var(--accent-verdigris)] font-medium">已通车</span>
                        ) : isCurrent ? (
                          <span className="text-[var(--accent-brass)] font-semibold flex items-center gap-1">
                            <span>CURRENT</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brass)] animate-ping" />
                          </span>
                        ) : (
                          <span className="text-[var(--text-ghost)]">前瞻刻度</span>
                        )}
                      </span>
                    </div>

                    {/* Stage Title */}
                    <div
                      className={`type-l4 font-medium transition-colors mb-1.5 truncate ${
                        isCompleted
                          ? 'text-[var(--text-primary)] group-hover:text-[var(--accent-verdigris)]'
                          : isCurrent
                          ? 'text-[var(--text-hero)] font-semibold'
                          : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {st.stageName}
                    </div>

                    {/* Empirical Reality vs Projected Horizon Footprint */}
                    <div className="min-h-[2.25rem] text-xs">
                      {isCompleted ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-mono text-[11px]">
                            <span>{st.dateRange || '已沉淀'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{st.touchCount}次 / {formatDurationHoursMins(st.totalMinutes)}</span>
                          </div>
                          {st.keyMilestones[0] ? (
                            <div className="text-[var(--text-secondary)] text-[11.5px] truncate font-normal">
                              ✓ {st.keyMilestones[0]}
                            </div>
                          ) : (
                            <div className="text-[var(--text-ghost)] text-[11px]">已达成此阶段核心目标</div>
                          )}
                        </div>
                      ) : isCurrent ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[var(--accent-brass)] font-mono text-[11px]">
                            <span>{st.dateRange || '当前正在推进'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{st.touchCount}次 / {formatDurationHoursMins(st.totalMinutes)}</span>
                          </div>
                          {st.keyMilestones[0] ? (
                            <div className="text-[var(--text-title)] text-[11.5px] truncate font-medium">
                              ▸ {st.keyMilestones[0]}
                            </div>
                          ) : (
                            <div className="text-[var(--text-secondary)] text-[11px]">当前主力攻坚阶段</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-[var(--text-ghost)] text-[11px] font-mono pt-1">
                          待抵达规划路线节点
                        </div>
                      )}
                    </div>

                    {/* Bottom Transit Link Line Indicator */}
                    <div
                      className={`mt-2 pt-1 border-t flex items-center justify-between text-[10px] font-mono ${
                        isCompleted
                          ? 'border-[var(--border-success)] text-[var(--accent-verdigris)]'
                          : isCurrent
                          ? 'border-[var(--accent-brass)]/40 text-[var(--accent-brass)]'
                          : 'border-[var(--border-subtle)] text-[var(--text-ghost)]'
                      }`}
                    >
                      <span>{isCompleted ? '历史足迹' : isCurrent ? '当前锚点' : '远期标杆'}</span>
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                        {isSelected ? '已选' : '点击切换'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspected Stage Quick Footprint Drawer */}
          {inspectedStage && (
            <div className="surface-optic-soft p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-panel)]/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[var(--accent-brass)] font-medium">
                    STAGE {String(inspectedStage.stageIndex + 1).padStart(2, '0')} · {inspectedStage.stageName}
                  </span>
                  <span className="text-[var(--text-ghost)]">|</span>
                  <span className="text-[var(--text-muted)]">
                    {inspectedStage.state === 'completed'
                      ? '已完成阶段脉络'
                      : inspectedStage.state === 'current'
                      ? '当前主力攻坚'
                      : '未来计划节点'}
                  </span>
                </div>
                {inspectedStage.totalMinutes > 0 && (
                  <span className="font-mono text-[var(--text-secondary)]">
                    累计心力: {formatDurationHoursMins(inspectedStage.totalMinutes)} ({inspectedStage.touchCount} 次记录)
                  </span>
                )}
              </div>

              {/* Milestones list for this stage */}
              {inspectedStage.state === 'future' ? (
                <p className="text-[var(--text-muted)] leading-relaxed">
                  作为前瞻路线规划，本阶段将在攻坚完成前序目标后开启。不需要在此时规划具体流水账，保留清晰的方向节点即可。
                </p>
              ) : inspectedStage.keyMilestones.length > 0 || inspectedStage.logs.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[var(--text-muted)] font-mono text-[11px]">阶段关键成果与沉淀：</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {inspectedStage.keyMilestones.slice(0, 4).map((m, i) => (
                      <div
                        key={i}
                        className="p-1.5 rounded bg-[var(--surface-recessed)]/40 border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-start gap-1.5"
                      >
                        <span className="text-[var(--accent-verdigris)] pt-0.5">✓</span>
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[var(--text-ghost)]">
                  暂无独立记录归档，随着推进会在此沉淀关键突破。
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 3. Epoch Strata View (宏观纪元剖面) */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono pb-1">
            <span>纪元档案：从创建至今日的实际演进切片</span>
            <button
              type="button"
              onClick={() => setIsEpochsExpanded(!isEpochsExpanded)}
              className="cockpit-action-text cursor-pointer text-xs flex items-center gap-1"
            >
              <span>{isEpochsExpanded ? '收起全部明细' : '展开全部明细'}</span>
              {isEpochsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="space-y-3">
            {overview.stages.map((st, idx) => {
              const isCompleted = st.state === 'completed';
              const isCurrent = st.state === 'current';
              const isFuture = st.state === 'future';

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isCurrent
                      ? 'border-[var(--accent-brass)] bg-[var(--surface-selected)]/40'
                      : isCompleted
                      ? 'border-[var(--border-accent-subtle)] bg-[var(--surface-panel)]/50'
                      : 'border-[var(--border-subtle)] bg-[var(--surface-recessed)]/20 border-dashed opacity-70'
                  }`}
                >
                  {/* Epoch Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[var(--divider-subtle)]">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-xs px-1.5 py-0.5 rounded font-semibold ${
                          isCompleted
                            ? 'bg-[var(--surface-success)] text-[var(--accent-verdigris)]'
                            : isCurrent
                            ? 'bg-[var(--accent-brass)]/20 text-[var(--accent-brass)]'
                            : 'bg-transparent text-[var(--text-ghost)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        EPOCH {String(idx + 1).padStart(2, '0')}
                      </span>
                      <h4 className="font-display font-medium text-sm text-[var(--text-title)]">
                        {st.stageName}
                      </h4>
                      {isCurrent && (
                        <span className="text-[11px] font-mono text-[var(--accent-brass)] font-semibold">
                          [当前攻坚]
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
                      {isFuture ? (
                        <span>远期规划</span>
                      ) : (
                        <>
                          <span>{st.dateRange}</span>
                          <span className="text-[var(--text-ghost)]">·</span>
                          <span>{st.touchCount}次推进</span>
                          <span className="text-[var(--text-ghost)]">·</span>
                          <span className="text-[var(--text-secondary)] font-medium">
                            {formatDurationHoursMins(st.totalMinutes)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Epoch Content */}
                  <div className="pt-2 text-xs space-y-2">
                    {isFuture ? (
                      <p className="text-[var(--text-ghost)] italic">
                        剩余路线规划刻度，攻坚至此时启动。
                      </p>
                    ) : (
                      <>
                        {/* Milestones / Completed tasks */}
                        {st.keyMilestones.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-mono text-[var(--text-ghost)]">突破与完成项：</span>
                            <div className="flex flex-wrap gap-1.5">
                              {st.keyMilestones.map((m, mIdx) => (
                                <span
                                  key={mIdx}
                                  className="px-2 py-0.5 rounded bg-[var(--surface-recessed)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                                >
                                  ✓ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Expanded Logs if requested */}
                        {isEpochsExpanded && st.logs.length > 0 && (
                          <div className="pt-2 space-y-1 border-t border-[var(--divider-subtle)]">
                            <span className="text-[11px] font-mono text-[var(--text-ghost)]">期间记录存根：</span>
                            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                              {st.logs.map(l => (
                                <div
                                  key={l.id}
                                  className="flex items-center justify-between py-1 px-2 rounded bg-[var(--surface-canvas)]/50 text-[var(--text-muted)]"
                                >
                                  <span className="font-mono text-[11px] shrink-0 pr-2">{formatCompactDate(l.date)}</span>
                                  <span className="text-[var(--text-secondary)] truncate flex-1">{l.content}</span>
                                  {l.duration_minutes && (
                                    <span className="font-mono text-[11px] shrink-0 pl-2 text-[var(--text-ghost)]">
                                      {l.duration_minutes}m
                                    </span>
                                  )}
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
      )}
    </section>
  );
};
