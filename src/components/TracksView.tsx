import React, { useEffect, useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { Card, LogEntry, NextAction, Track, TrackRole } from '../types';
import { calculateStalenessDays } from '../lib/recommendation';
import { InlineEmptyState } from './InlineEmptyState';
import { CockpitTooltip } from './ui/CockpitTooltip';
import { CockpitConfirmAction } from './ui/CockpitConfirmAction';
import { CockpitInspectionNote } from './ui/CockpitInspectionNote';

interface TracksViewProps {
  tracks: Track[];
  actions: NextAction[];
  logs: LogEntry[];
  cards: Card[];
  currentDateStr: string;
  onUpdateTrackRole: (trackId: string, role: TrackRole) => void;
  onUpdateTrackStage: (trackId: string, stageIndex: number) => void;
  onAddNextAction: (trackId: string, title: string, effort: 'light' | 'normal' | 'deep', note?: string) => void;
  onCompleteAction: (actionId: string) => void;
  onDeleteAction: (actionId: string) => void;
  onStartSession: (trackId: string, actionId?: string, title?: string) => void;
  onOpenCard: (card: Card) => void;
  onAddNewTrack: (name: string, description: string, role: TrackRole, stages: string[]) => void;
  shouldOpenNewTrackComposer?: boolean;
  onNewTrackComposerOpened?: () => void;
  onCreatedFromToday?: () => void;
  onNewTrackComposerDismissed?: () => void;
}

const ROADMAP_DESKTOP_COLUMNS = 5;
const ROADMAP_MOBILE_COLUMNS = 3;

const getRoadmapColumnCount = (stageCount: number, maximum: number) =>
  Math.max(1, Math.min(stageCount, maximum));

type RoadmapDirection = 'forward' | 'reverse';
type RoadmapConnection = 'inline' | 'turn' | 'none';

interface RoadmapGridPosition {
  row: number;
  column: number;
  direction: RoadmapDirection;
  connection: RoadmapConnection;
}

const getStageGridPosition = (
  index: number,
  stageCount: number,
  columnCount: number
): RoadmapGridPosition => {
  const rowIndex = Math.floor(index / columnCount);
  const offsetInRow = index % columnCount;
  const isReverse = rowIndex % 2 === 1;
  const isLastStage = index === stageCount - 1;

  return {
    row: rowIndex + 1,
    column: isReverse ? columnCount - offsetInRow : offsetInRow + 1,
    direction: isReverse ? 'reverse' : 'forward',
    connection: isLastStage
      ? 'none'
      : offsetInRow === columnCount - 1
        ? 'turn'
        : 'inline',
  };
};

const getTrackIndexMeta = (track: Track, currentDateStr: string) => {
  const roleLabel: Record<TrackRole, string> = {
    main: 'MAIN',
    maintenance: 'KEEP',
    paused: 'PAUSED',
  };
  const staleness = calculateStalenessDays(track.last_touched_at, currentDateStr);
  const stalenessMetric = staleness === 0 ? 'TODAY' : staleness === 999 ? '—' : `${staleness}D`;
  const stageMetric = track.roadmap.length === 0
    ? '—'
    : `${String(track.current_stage_index + 1).padStart(2, '0')}/${String(track.roadmap.length).padStart(2, '0')}`;

  return {
    roleLabel: roleLabel[track.role],
    roleClassName: `track-index-role-dot--${track.role}`,
    metric: track.role === 'main' ? stageMetric : stalenessMetric,
  };
};

export const TracksView: React.FC<TracksViewProps> = ({
  tracks,
  actions,
  logs,
  cards,
  currentDateStr,
  onUpdateTrackRole,
  onUpdateTrackStage,
  onAddNextAction,
  onCompleteAction,
  onDeleteAction,
  onStartSession,
  onOpenCard,
  onAddNewTrack,
  shouldOpenNewTrackComposer = false,
  onNewTrackComposerOpened,
  onCreatedFromToday,
  onNewTrackComposerDismissed,
}) => {
  // Keep the existing initial selection for populated datasets. An empty dataset
  // begins without a selection, and must not fall back once a track is added.
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [newTrackRole, setNewTrackRole] = useState<TrackRole>('main');
  const [newTrackStages, setNewTrackStages] = useState('基础理解, 小 Demo, 完整项目, 求职包装');

  useEffect(() => {
    if (shouldOpenNewTrackComposer) {
      setShowAddTrackModal(true);
      onNewTrackComposerOpened?.();
    }
  }, [shouldOpenNewTrackComposer, onNewTrackComposerOpened]);

  // Quick add Next action state
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionEffort, setActionEffort] = useState<'light' | 'normal' | 'deep'>('normal');

  // Do not fall back to tracks[0]: an empty selection is its own page state.
  const selectedTrack = tracks.find(t => t.id === selectedTrackId);
  const hasTracks = tracks.length > 0;

  const handleCreateTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;
    const stages = newTrackStages
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);
    onAddNewTrack(
      newTrackName.trim(),
      newTrackDesc.trim(),
      newTrackRole,
      stages.length > 0 ? stages : ['起步', '推进', '收尾']
    );
    setNewTrackName('');
    setNewTrackDesc('');
    setShowAddTrackModal(false);
    onCreatedFromToday?.();
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !selectedTrack) return;
    onAddNextAction(selectedTrack.id, actionTitle.trim(), actionEffort, actionNote.trim() || undefined);
    setActionTitle('');
    setActionNote('');
    setIsAddingAction(false);
  };

  const activeTrackActions = actions
    .filter(a => a.track_id === selectedTrack?.id && a.status === 'active')
    .sort((a, b) => a.position - b.position);

  const laterTrackActions = actions
    .filter(a => a.track_id === selectedTrack?.id && a.status === 'later')
    .sort((a, b) => a.position - b.position);

  const relatedCards = cards.filter(c => c.track_id === selectedTrack?.id);
  const roadmapDesktopColumns = getRoadmapColumnCount(
    selectedTrack?.roadmap.length ?? 0,
    ROADMAP_DESKTOP_COLUMNS
  );
  const roadmapMobileColumns = getRoadmapColumnCount(
    selectedTrack?.roadmap.length ?? 0,
    ROADMAP_MOBILE_COLUMNS
  );

  // Recent touches for selected track
  const getLogOccurredAt = (log: LogEntry) => {
    const eventTime = log.ended_at || log.started_at;
    if (eventTime) return `${log.date}T${eventTime}`;
    return log.created_at.includes('T') ? log.created_at : `${log.date}T00:00:00`;
  };

  const trackLogs = logs
    .filter(l => l.track_id === selectedTrack?.id)
    .sort((a, b) => getLogOccurredAt(b).localeCompare(getLogOccurredAt(a)))
    .slice(0, 6);

  // Helper to format log date like "9/30"
  const formatLogDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Helper to format duration like "55m" or "1h20m"
  const formatDuration = (mins?: number) => {
    if (!mins) return null;
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}m` : `${h}h`;
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[var(--text-primary)] p-6 lg:p-8">
      {/* Main Container: Fixed 880px max-width for crisp desktop engineering dossier presence */}
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-5 border-b border-[#b8894f]/15 gap-4">
          <div>
            <div className="type-l6 font-mono text-[var(--text-ghost)] tracking-wider uppercase mb-1 font-medium">
              TRACK DIRECTION / 管方向，不管每天
            </div>
            <h1 className="text-[30px] leading-[36px] font-display font-semibold text-[var(--text-hero)] flex items-baseline gap-2.5">
              <span>主线脉络</span>
              <span className="type-l6 font-mono font-normal text-[var(--text-ghost)] tracking-widest">/ TRACKS</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setShowAddTrackModal(true)}
              className={`cockpit-button cursor-pointer ${hasTracks ? 'cockpit-button--secondary cockpit-button--brass-action' : 'cockpit-button--primary'}`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建主线</span>
            </button>
          </div>
        </header>

        {/* Two-Column Structure with Subtle Vertical Dossier Divider */}
        <div className="flex flex-col md:flex-row gap-7 md:gap-8 items-start">
          {/* Left Column: Track Index / 主线目录 */}
          <nav
            className={`w-full md:w-[198px] shrink-0 space-y-2 md:pr-7 ${
              hasTracks ? 'md:border-r md:border-[#b8894f]/12' : ''
            }`}
          >
            <div className="type-l6 font-mono uppercase tracking-widest text-[var(--text-muted)] px-2 pb-2 border-b border-[#b8894f]/12 flex items-center justify-between font-medium">
              <span>ALL COURSES</span>
              <span className="text-[var(--text-muted)] font-mono text-[11.5px] font-semibold">{tracks.length}</span>
            </div>

            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:gap-0.5 pt-1">
              {!hasTracks ? (
                <InlineEmptyState
                  className="tracks-empty-state px-2.5 py-3"
                  label="暂无主线"
                  description="从一条近期想持续推进的方向开始。"
                />
              ) : (
                tracks.map(t => {
                const isSelected = t.id === selectedTrack?.id;
                const { roleLabel, roleClassName, metric } = getTrackIndexMeta(t, currentDateStr);

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTrackId(t.id)}
                    aria-current={isSelected ? 'page' : undefined}
                    className={`track-index-item shrink-0 md:shrink w-52 md:w-full cursor-pointer ${isSelected ? 'is-selected' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`track-index-role-dot ${roleClassName}`}
                        aria-hidden="true"
                      />
                      <span className="track-index-title">
                        {t.name}
                      </span>
                    </div>

                    <div className="track-index-meta">
                      <span>{roleLabel}</span>
                      <span className="track-index-metric">{metric}</span>
                    </div>
                  </button>
                );
                })
              )}
            </div>
          </nav>

          {/* Right Column: Track Dossier / 主线档案 */}
          {selectedTrack ? (
            <div className="flex-1 min-w-0 space-y-8">
              {/* Dossier Header with soft optical depth (surface-optic-soft) */}
              <div className="surface-optic-soft track-profile-surface track-detail-content-inset py-4 sm:py-5 rounded-lg space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5">
                  <div className="type-l6 font-mono text-[var(--text-muted)] uppercase tracking-wider font-medium">
                    TRACK DOSSIER / 主线档案
                  </div>

                  {/* Segmented Role Control */}
                  <div className="segmented-control compact track-role-selector self-start sm:self-auto" role="group" aria-label="主线角色">
                    {(['main', 'maintenance', 'paused'] as TrackRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => onUpdateTrackRole(selectedTrack.id, role)}
                        aria-pressed={selectedTrack.role === role}
                        data-role={role}
                        className={`segmented-item cursor-pointer ${selectedTrack.role === role ? 'is-selected' : ''}`}
                      >
                        {role === 'main' ? '主线' : role === 'maintenance' ? '保温' : '暂缓'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track Title */}
                <h2 className="text-[24px] leading-tight font-display font-semibold text-[var(--text-title)] tracking-tight">
                  {selectedTrack.name}
                </h2>

                {/* Purpose Paragraph */}
                <p className="track-purpose">
                  {selectedTrack.description || '暂无明确目标描述'}
                </p>
              </div>

              {/* Roadmap Scale (Mechanical instrument gauge) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3 pb-1">
                  <span className="track-section-label">ROADMAP SCALE / 路线刻度</span>
                  <span className="track-section-help">点击刻度切换当前位置</span>
                </div>

                {/* Instrument Gauge Line & Station Markers */}
                <div className="py-2">
                  <div
                    className="track-roadmap-grid"
                    style={{
                      '--roadmap-desktop-columns': roadmapDesktopColumns,
                      '--roadmap-mobile-columns': roadmapMobileColumns,
                    } as React.CSSProperties}
                  >
                    {selectedTrack.roadmap.map((stage, idx) => {
                      const isCurrent = idx === selectedTrack.current_stage_index;
                      const isCompleted = idx < selectedTrack.current_stage_index;
                      const stageState = isCompleted ? 'completed' : isCurrent ? 'current' : 'future';
                      const desktopPosition = getStageGridPosition(
                        idx,
                        selectedTrack.roadmap.length,
                        roadmapDesktopColumns
                      );
                      const mobilePosition = getStageGridPosition(
                        idx,
                        selectedTrack.roadmap.length,
                        roadmapMobileColumns
                      );
                      const gridStyle = {
                        '--roadmap-desktop-column': desktopPosition.column,
                        '--roadmap-desktop-row': desktopPosition.row,
                        '--roadmap-mobile-column': mobilePosition.column,
                        '--roadmap-mobile-row': mobilePosition.row,
                      } as React.CSSProperties;
                      const stageStateLabel = isCompleted ? '已完成' : isCurrent ? '当前位置' : '尚未开始';

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onUpdateTrackStage(selectedTrack.id, idx)}
                          aria-label={`切换到路线节点 ${idx + 1}：${stage}，${stageStateLabel}`}
                          data-desktop-direction={desktopPosition.direction}
                          data-desktop-connection={desktopPosition.connection}
                          data-mobile-direction={mobilePosition.direction}
                          data-mobile-connection={mobilePosition.connection}
                          className={`track-roadmap-stage track-roadmap-stage--${stageState} group cursor-pointer`}
                          style={gridStyle}
                        >
                          {/* Top: 01, 02, 03 Number */}
                          <div
                            className="track-roadmap-number"
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </div>

                          {/* Middle: Station Node with Connecting Rail Segment */}
                          <span
                            className={`track-roadmap-turn track-roadmap-turn--${stageState}`}
                            aria-hidden="true"
                          />
                          <div className={`track-roadmap-marker track-roadmap-marker--${stageState}`}>
                            <span
                              className={`track-roadmap-link track-roadmap-link--${stageState}`}
                              aria-hidden="true"
                            />

                            {/* Station Node Marker */}
                            <span className={`track-roadmap-socket track-roadmap-socket--${stageState}`}>
                              {isCompleted ? (
                                <Check className="track-roadmap-check" aria-hidden="true" />
                              ) : isCurrent ? (
                                <span className="track-roadmap-core track-roadmap-core--current" />
                              ) : (
                                <span className="track-roadmap-core track-roadmap-core--future" />
                              )}
                            </span>
                          </div>

                          {/* Bottom: Stage Label & Current Indicator */}
                          <div className="space-y-0.5">
                            <div
                              className={`type-l5 leading-snug transition-colors font-medium ${
                                isCompleted
                                  ? 'text-[#78998d]'
                                  : isCurrent
                                  ? 'text-[var(--text-title)] font-semibold'
                                  : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {stage}
                            </div>
                            {isCurrent && (
                              <div className="track-roadmap-current">
                                CURRENT
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* NEXT ACTIONS Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#b8894f]/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="track-section-label">
                        {isAddingAction ? 'NEXT ACTIONS / 正在新增' : 'NEXT ACTIONS / 接下来行动'}
                      </span>
                      {!isAddingAction && (
                        <CockpitInspectionNote
                          id="next-actions-popover"
                          title="关于 Next"
                          tone="brass"
                          ariaLabel="查看 Next 说明"
                        >
                          <p>最多保留 1–3 个 Next，让真正靠近执行的事情保持清楚。</p>
                          <p className="inspection-note-secondary">Next 是当前最确定、最容易启动的下一步，不需要提前规划完整路线。</p>
                        </CockpitInspectionNote>
                      )}
                    </div>
                    {isAddingAction && <p className="next-actions-state-help">填写当前最容易启动的第一步</p>}
                  </div>

                  {!isAddingAction && (
                    <button
                      onClick={() => setIsAddingAction(true)}
                      className="cockpit-button cockpit-button--secondary cockpit-button--brass-action cockpit-button--compact cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增</span>
                    </button>
                  )}
                </div>

                {/* Content States */}
                {isAddingAction ? (
                  <form
                    onSubmit={handleCreateAction}
                    className="inline-action-composer"
                  >
                    <div className="inline-action-field">
                      <label htmlFor="track-next-title" className="inline-action-label">
                        下一步行动
                      </label>
                      <input
                        id="track-next-title"
                        type="text"
                        placeholder="如：跑一个最小 MCP Server"
                        value={actionTitle}
                        onChange={e => setActionTitle(e.target.value)}
                        className="inline-action-slot"
                        autoFocus
                      />
                    </div>

                    <div className="inline-action-field">
                      <label htmlFor="track-next-note" className="inline-action-label">
                        备注 / 上下文（可选）
                      </label>
                      <input
                        id="track-next-note"
                        type="text"
                        placeholder="如：昨天刚完成 tool calling，继续这里上下文最完整"
                        value={actionNote}
                        onChange={e => setActionNote(e.target.value)}
                        className="inline-action-slot"
                      />
                    </div>

                    <div className="inline-action-controls">
                      <div className="inline-action-effort">
                        <span className="inline-action-control-label">投入程度</span>
                        <div className="segmented-control compact quick-add-effort" role="group" aria-label="投入程度">
                          {(['light', 'normal', 'deep'] as const).map(eff => (
                            <button
                              key={eff}
                              type="button"
                              onClick={() => setActionEffort(eff)}
                              aria-pressed={actionEffort === eff}
                              data-effort={eff}
                              className={`segmented-item cursor-pointer ${actionEffort === eff ? 'is-selected' : ''}`}
                            >
                              {eff === 'light' ? '轻量' : eff === 'normal' ? '正常' : '深入'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="inline-action-commit">
                        <button
                          type="button"
                          onClick={() => setIsAddingAction(false)}
                          className="cockpit-action-text cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={!actionTitle.trim()}
                          className="cockpit-button cockpit-button--primary cockpit-button--compact cursor-pointer"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </form>
                ) : activeTrackActions.length === 0 ? (
                  <InlineEmptyState
                    className="tracks-next-empty py-4"
                    label="暂无 Next"
                    description="先留下当前最确定、最容易启动的一步。"
                  />
                ) : (
                  <div className="divide-y divide-[#b8894f]/10">
                    {activeTrackActions.map((action, idx) => (
                      <div
                        key={action.id}
                        className="track-action-row group"
                      >
                        <div className="track-action-copy">
                          <span className="type-l6 font-mono text-[var(--text-muted)] pt-0.5 shrink-0 select-none font-medium">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="space-y-0.5 min-w-0">
                            <div className="type-l4 font-medium text-[var(--text-primary)] group-hover:text-[var(--text-hero)] transition-colors">
                              {action.title}
                            </div>
                            {action.note && (
                              <p className="type-l5 text-[var(--text-secondary)] leading-relaxed">
                                {action.note}
                              </p>
                            )}
                            <div className="flex items-center gap-2 type-l6 text-[var(--text-muted)] font-medium">
                              <span
                                className={
                                  action.effort === 'deep'
                                    ? 'text-[#c87a3e] font-medium'
                                    : action.effort === 'normal'
                                    ? 'text-[#b8894f] font-medium'
                                    : 'text-[#78998d] font-medium'
                                }
                              >
                                {action.effort === 'deep'
                                  ? '深入'
                                  : action.effort === 'normal'
                                  ? '正常'
                                  : '轻量'}
                              </span>
                              <span className="text-[var(--text-ghost)]" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-[var(--text-muted)]">
                                {action.effort === 'deep'
                                  ? '30–60m'
                                  : action.effort === 'normal'
                                  ? '15–30m'
                                  : '5–15m'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="track-action-controls">
                          <CockpitTooltip content="开始此行动"><button
                            onClick={() =>
                              onStartSession(
                                selectedTrack.id,
                                action.id,
                                `${selectedTrack.name} · ${action.title}`
                              )
                            }
                            className="cockpit-button cockpit-button--secondary cockpit-button--brass-action cockpit-button--compact cursor-pointer"
                            aria-label="开始此行动"
                          >
                            <span>开始</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button></CockpitTooltip>
                          <CockpitTooltip content="标记完成"><button
                            onClick={() => onCompleteAction(action.id)}
                            className="cockpit-icon-button cockpit-icon-button--complete cursor-pointer"
                            aria-label="标记完成"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button></CockpitTooltip>
                          <CockpitConfirmAction tooltip="删除行动" title="删除这个行动？" description="行动会从当前主线中永久移除。" onConfirm={() => onDeleteAction(action.id)}>{({ ref, onClick, expanded }) => <button
                            ref={ref}
                            onClick={onClick}
                            className="cockpit-icon-button cockpit-icon-button--danger track-action-delete cursor-pointer"
                            aria-label="删除行动"
                            aria-expanded={expanded}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>}</CockpitConfirmAction>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Later / Backlog candidates */}
                {laterTrackActions.length > 0 && !isAddingAction && (
                  <div className="pt-3 border-t border-[#b8894f]/12 space-y-2">
                    <div className="track-section-label">
                      LATER / 后续候选
                    </div>
                    <div className="space-y-1">
                      {laterTrackActions.map(action => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between type-l5 text-[var(--text-secondary)] py-1 px-2 rounded hover:bg-[#181614]/40"
                        >
                          <span className="font-medium">{action.title}</span>
                          <span className="type-l6 font-mono text-[var(--text-muted)] font-medium">
                            {action.effort === 'deep' ? '深入' : action.effort === 'normal' ? '正常' : '轻量'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Touches & Resources Sections (Refined Editorial Journal without excessive lines) */}
              <div className={`pt-3 ${trackLogs.length === 0 && relatedCards.length === 0 ? 'space-y-5' : 'space-y-7'}`}>
                {/* RECENT TOUCHES Chapter */}
                <div className={trackLogs.length === 0 ? 'space-y-1.5' : 'space-y-2'}>
                  <div className="flex items-center justify-between">
                    <span className="track-section-label">
                      RECENT TOUCHES / 最近发生
                    </span>
                    <span className="type-l6 font-mono text-[var(--text-muted)] text-[12px] font-medium">
                      {trackLogs.length}
                    </span>
                  </div>

                  {trackLogs.length === 0 ? (
                    <InlineEmptyState className="py-1" label="暂无记录" />
                  ) : (
                    <div className="recent-touch-list">
                      {trackLogs.map(l => (
                        <div
                          key={l.id}
                          className="recent-touch-row"
                        >
                          <span className="recent-touch-date">{formatLogDate(l.date)}</span>
                          <span className="recent-touch-content">{l.content}</span>
                          <span className="recent-touch-duration">{formatDuration(l.duration_minutes) ?? ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RESOURCES Chapter */}
                <div className={relatedCards.length === 0 ? 'space-y-1.5' : 'space-y-2'}>
                  <div className="flex items-center justify-between">
                    <span className="track-section-label">
                      RESOURCES / 关联资源
                    </span>
                    <span className="type-l6 font-mono text-[var(--text-muted)] text-[12px] font-medium">
                      {relatedCards.length}
                    </span>
                  </div>

                  {relatedCards.length === 0 ? (
                    <InlineEmptyState className="py-1" label="暂无关联资源" />
                  ) : (
                    <div className="space-y-0.5">
                      {relatedCards.map(c => (
                        <button
                          key={c.id}
                          onClick={() => onOpenCard(c)}
                          className="w-full py-1.5 flex items-center justify-between text-left group hover:bg-[#181614]/40 px-1 -mx-1 rounded transition-colors cursor-pointer"
                        >
                          <span className="type-l5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors truncate pr-4 font-[450]">
                            {c.title}
                          </span>
                          <ArrowUpRight className="track-resource-arrow" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : hasTracks ? (
            <div className="flex-1 min-w-0 track-detail-content-inset pt-1">
              <InlineEmptyState
                className="py-3"
                label="选择一条主线查看档案"
                description="目标、路线与 Next 会显示在这里。"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-optic-soft p-5 sm:p-6 rounded-lg max-w-[36rem] w-full space-y-4 border border-[#b8894f]/20 shadow-lg">
            <div><h3 className="font-display text-lg font-semibold text-[var(--text-hero)]">新建主线</h3><p className="type-l5 text-[var(--text-secondary)] mt-1">留下一条接下来一段时间想持续推进的方向。</p></div>
            <form onSubmit={handleCreateTrack} className="space-y-4 type-l5">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">主线名称</label>
                <input
                  type="text"
                  placeholder="如: Agent / AI, 算法, Linux/C"
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  className="form-slot px-3 py-2"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-medium">为什么做这条主线</label>
                <textarea
                  placeholder="如: 掌握现代 Agent 开发，并形成一个可以用于求职展示的项目。"
                  value={newTrackDesc}
                  onChange={e => setNewTrackDesc(e.target.value)}
                  className="form-slot px-3 py-2 h-20"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">当前角色</label>
                <div className="segmented-control compact track-role-selector track-role-selector--wide" role="group" aria-label="当前角色">
                  {(['main', 'maintenance', 'paused'] as TrackRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewTrackRole(role)}
                      aria-pressed={newTrackRole === role}
                      data-role={role}
                      className={`segmented-item cursor-pointer ${newTrackRole === role ? 'is-selected' : ''}`}
                    >
                      {role === 'main' ? '主线' : role === 'maintenance' ? '保温' : '暂缓'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">路线节点</label>
                <p className="type-l6 text-[var(--text-ghost)] mb-1.5">用逗号分隔路线节点，建议先写 3–5 个。</p>
                <input
                  type="text"
                  value={newTrackStages}
                  onChange={e => setNewTrackStages(e.target.value)}
                  className="form-slot px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddTrackModal(false); onNewTrackComposerDismissed?.(); }}
                  className="cockpit-action-text cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newTrackName.trim()}
                  className="cockpit-button cockpit-button--primary cursor-pointer"
                >
                  创建主线
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
