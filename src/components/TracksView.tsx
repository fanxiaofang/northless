import React, { useEffect, useState } from 'react';
import {
  Plus,
  Play,
  CheckCircle2,
  Trash2,
  ArrowRight,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { Card, LogEntry, NextAction, Phase, Track, TrackRole } from '../types';
import { calculateStalenessDays } from '../lib/recommendation';
import { InlineEmptyState } from './InlineEmptyState';

interface TracksViewProps {
  tracks: Track[];
  actions: NextAction[];
  logs: LogEntry[];
  cards: Card[];
  currentPhase?: Phase;
  currentDateStr: string;
  onUpdateTrackRole: (trackId: string, role: TrackRole) => void;
  onUpdateTrackStage: (trackId: string, stageIndex: number) => void;
  onAddNextAction: (trackId: string, title: string, effort: 'light' | 'normal' | 'deep', note?: string) => void;
  onCompleteAction: (actionId: string) => void;
  onDeleteAction: (actionId: string) => void;
  onStartSession: (trackId: string, actionId?: string, title?: string) => void;
  onOpenCard: (card: Card) => void;
  onAddNewTrack: (name: string, description: string, role: TrackRole, stages: string[]) => void;
  onOpenPhaseSettings: () => void;
  shouldOpenNewTrackComposer?: boolean;
  onNewTrackComposerOpened?: () => void;
  onCreatedFromToday?: () => void;
  onNewTrackComposerDismissed?: () => void;
}

export const TracksView: React.FC<TracksViewProps> = ({
  tracks,
  actions,
  logs,
  cards,
  currentPhase,
  currentDateStr,
  onUpdateTrackRole,
  onUpdateTrackStage,
  onAddNextAction,
  onCompleteAction,
  onDeleteAction,
  onStartSession,
  onOpenCard,
  onAddNewTrack,
  onOpenPhaseSettings,
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

  // Recent touches for selected track
  const trackLogs = logs
    .filter(l => l.track_id === selectedTrack?.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
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

  const getRoleHeaderKicker = (role: TrackRole) => {
    switch (role) {
      case 'main':
        return 'MAIN COURSE / 主线档案';
      case 'maintenance':
        return 'MAINTENANCE COURSE / 保温档案';
      case 'paused':
        return 'PAUSED COURSE / 暂缓档案';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[var(--text-primary)] p-6 lg:p-8">
      {/* Main Container: Fixed 880px max-width for crisp desktop engineering dossier presence */}
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-5 border-b border-[#b8894f]/15 gap-4">
          <div>
            <div className="type-l6 font-mono text-[var(--text-ghost)] tracking-wider uppercase mb-1 font-medium">
              PHASE DIRECTION / 管方向，不管每天
            </div>
            <h1 className="text-[30px] leading-[36px] font-display font-semibold text-[var(--text-hero)] flex items-baseline gap-2.5">
              <span>主线脉络</span>
              <span className="type-l6 font-mono font-normal text-[var(--text-ghost)] tracking-widest">/ TRACKS</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={onOpenPhaseSettings}
              className="btn-secondary px-3 py-1.5 rounded type-l5 text-[var(--text-primary)] hover:text-[var(--text-hero)] transition-colors cursor-pointer font-medium"
            >
              当前阶段: <strong className="text-[#b8894f] font-normal">{currentPhase?.name || '探索期'}</strong>
            </button>
            <button
              onClick={() => setShowAddTrackModal(true)}
              className="brass-button px-3.5 py-1.5 rounded type-l5 font-medium text-[var(--text-primary)] hover:text-[var(--text-hero)] flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#c89a5a]" />
              <span>新建主线</span>
            </button>
          </div>
        </header>

        {/* Two-Column Structure with Subtle Vertical Dossier Divider */}
        <div className="flex flex-col md:flex-row gap-7 md:gap-8 items-start">
          {/* Left Column: Track Index / 主线目录 */}
          <nav
            className={`w-full md:w-[190px] shrink-0 space-y-2 md:pr-7 ${
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
                const staleness = calculateStalenessDays(t.last_touched_at, currentDateStr);
                const isMain = t.role === 'main';
                const isMaint = t.role === 'maintenance';

                const roleLabel = isMain ? 'MAIN' : isMaint ? 'MAINTENANCE' : 'PAUSED';
                const stageStr = `${String(t.current_stage_index + 1).padStart(2, '0')}/${String(t.roadmap.length).padStart(2, '0')}`;
                const stalenessStr = staleness === 0 ? 'TODAY' : staleness === 999 ? '—' : `${staleness}D`;
                const metaLine = isMain ? `${roleLabel} · ${stageStr}` : `${roleLabel} · ${stalenessStr}`;

                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrackId(t.id)}
                    className={`text-left py-2 px-2.5 transition-colors flex flex-col gap-1 shrink-0 md:shrink w-52 md:w-full border-l-2 cursor-pointer ${
                      isSelected
                        ? 'border-l-[#b8894f] bg-transparent text-[var(--text-hero)]'
                        : 'border-l-transparent bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-l-[#54483b]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-[7px] h-[7px] rounded-full shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#b8894f]'
                            : isMain
                            ? 'bg-[#8a7250]'
                            : 'bg-[#54483b]'
                        }`}
                      />
                      <span className={`type-l4 truncate ${isSelected ? 'font-semibold text-[var(--text-hero)]' : 'font-medium'}`}>
                        {t.name}
                      </span>
                    </div>

                    <div className={`pl-3.5 type-l6 font-mono font-medium ${isSelected ? 'text-[#b8894f]' : 'text-[var(--text-muted)]'}`}>
                      {metaLine}
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
                    {getRoleHeaderKicker(selectedTrack.role)}
                  </div>

                  {/* Segmented Role Control */}
                  <div className="flex items-center gap-0.5 bg-[#151412] p-0.5 rounded border border-[#b8894f]/15 self-start sm:self-auto">
                    {(['main', 'maintenance', 'paused'] as TrackRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => onUpdateTrackRole(selectedTrack.id, role)}
                        className={`px-2.5 py-0.5 type-l6 font-mono rounded transition-colors cursor-pointer ${
                          selectedTrack.role === role
                            ? 'bg-[#251f18] text-[#b8894f] border border-[#b8894f]/35 shadow-2xs font-semibold'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                        }`}
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
                <p className="type-l4 text-[var(--text-primary)] leading-relaxed max-w-2xl pt-0.5">
                  {selectedTrack.description || '暂无明确目标描述'}
                </p>
              </div>

              {/* Roadmap Scale (Mechanical instrument gauge) */}
              <div className="space-y-3 pt-1">
                <div className="type-l6 font-mono text-[var(--text-muted)] tracking-wider uppercase flex items-center justify-between pb-1 font-medium">
                  <span>ROADMAP SCALE / 路线刻度</span>
                  <span className="text-[var(--text-secondary)] text-[12px] font-sans">点击刻度切换当前阶段</span>
                </div>

                {/* Instrument Gauge Line & Station Markers */}
                <div className="py-2">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${selectedTrack.roadmap.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {selectedTrack.roadmap.map((stage, idx) => {
                      const isCurrent = idx === selectedTrack.current_stage_index;
                      const isCompleted = idx < selectedTrack.current_stage_index;

                      return (
                        <button
                          key={idx}
                          onClick={() => onUpdateTrackStage(selectedTrack.id, idx)}
                          className="group flex flex-col items-start text-left focus:outline-hidden cursor-pointer"
                        >
                          {/* Top: 01, 02, 03 Number */}
                          <div
                            className={`type-l6 font-mono font-medium pb-1.5 transition-colors ${
                              isCompleted
                                ? 'text-[#78998d]'
                                : isCurrent
                                ? 'text-[#b8894f] font-semibold'
                                : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </div>

                          {/* Middle: Station Node with Connecting Rail Segment */}
                          <div className="w-full relative flex items-center h-[20px] mb-2">
                            {/* Connecting Line to next station */}
                            {idx < selectedTrack.roadmap.length - 1 && (
                              <div
                                className={`absolute left-[10px] right-0 h-[2px] z-0 ${
                                  isCompleted
                                    ? 'bg-[#4e6b60]'
                                    : isCurrent
                                    ? 'bg-gradient-to-r from-[#b8894f] to-[#30281e]'
                                    : 'bg-[#25201a]'
                                }`}
                              />
                            )}

                            {/* Connecting Line from prev station */}
                            {idx > 0 && (
                              <div
                                className={`absolute left-0 right-[calc(100%-10px)] h-[2px] z-0 ${
                                  isCompleted || isCurrent
                                    ? 'bg-[#4e6b60]'
                                    : 'bg-[#25201a]'
                                }`}
                              />
                            )}

                            {/* Station Node Marker */}
                            <span
                              className={`relative z-10 w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-[#15201c] border-2 border-[#4e6b60] text-[#78998d]'
                                  : isCurrent
                                  ? 'bg-[#261e14] border-2 border-[#b8894f] text-[#c89a5a] shadow-2xs'
                                  : 'bg-[#161513] border-2 border-[#362e24] text-[var(--text-ghost)] group-hover:border-[#524434]'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 text-[#78998d] stroke-[2.5]" />
                              ) : isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-[#b8894f]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#362e24] group-hover:bg-[#524434]" />
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
                              <div className="type-l6 font-mono text-[#b8894f] tracking-wider text-[10.5px] uppercase font-semibold">
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
                <div className="flex items-center justify-between pb-2 border-b border-[#b8894f]/15">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="type-l6 font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
                        {isAddingAction ? 'NEXT ACTIONS / 正在新增' : 'NEXT ACTIONS / 接下来行动'}
                      </span>
                    </div>
                    <p className="type-l5 text-[var(--text-secondary)] mt-0.5 font-normal">
                      {isAddingAction ? '填写当前最容易启动的第一步' : '最多 1–3 个，保持近处清楚'}
                    </p>
                  </div>

                  {!isAddingAction && (
                    <button
                      onClick={() => setIsAddingAction(true)}
                      className="btn-secondary flex items-center gap-1.5 type-l5 text-[#b8894f] hover:text-[var(--text-hero)] transition-colors py-1 px-2.5 rounded cursor-pointer font-medium"
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
                    className="p-4 rounded-lg border border-[#b8894f]/25 bg-[#161412] space-y-3.5 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <label className="type-l6 font-mono uppercase text-[var(--text-muted)] block font-medium">
                        下一步行动
                      </label>
                      <input
                        type="text"
                        placeholder="如：跑一个最小 MCP Server"
                        value={actionTitle}
                        onChange={e => setActionTitle(e.target.value)}
                        className="w-full bg-[#121110] border border-[#b8894f]/20 rounded px-3 py-1.5 type-l5 text-[var(--text-primary)] focus:outline-hidden focus:border-[#b8894f]"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="type-l6 font-mono uppercase text-[var(--text-muted)] block font-medium">
                        备注 / 上下文 (可选)
                      </label>
                      <input
                        type="text"
                        placeholder="如：昨天刚完成 tool calling，继续这里上下文最完整"
                        value={actionNote}
                        onChange={e => setActionNote(e.target.value)}
                        className="w-full bg-[#121110] border border-[#b8894f]/20 rounded px-3 py-1.5 type-l5 text-[var(--text-primary)] focus:outline-hidden focus:border-[#b8894f]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 type-l5">
                        <span className="text-[var(--text-muted)] type-l6 font-mono uppercase font-medium">EFFORT:</span>
                        {(['light', 'normal', 'deep'] as const).map(eff => (
                          <button
                            key={eff}
                            type="button"
                            onClick={() => setActionEffort(eff)}
                            className={`px-2.5 py-1 rounded type-l6 font-mono transition-colors cursor-pointer ${
                              actionEffort === eff
                                ? eff === 'light'
                                ? 'bg-[#17231f] text-[#78998d] border border-[#4a635a] font-semibold'
                                : eff === 'normal'
                                ? 'bg-[#282015] text-[#b8894f] border border-[#8a6a3b] font-semibold'
                                : 'bg-[#291b14] text-[#c87a3e] border border-[#8a4e29] font-semibold'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium'
                            }`}
                          >
                            {eff === 'light' ? '轻量' : eff === 'normal' ? '正常' : '深入'}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingAction(false)}
                          className="px-3 py-1 type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="brass-button px-4 py-1 type-l5 font-medium text-[var(--text-hero)] rounded cursor-pointer"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </form>
                ) : activeTrackActions.length === 0 ? (
                  <InlineEmptyState
                    className="py-4"
                    label="暂无 Next"
                    description="先留下当前最确定、最容易启动的一步。"
                  />
                ) : (
                  <div className="divide-y divide-[#b8894f]/10">
                    {activeTrackActions.map((action, idx) => (
                      <div
                        key={action.id}
                        className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-[#181614]/40 px-2 -mx-2 rounded"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
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

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() =>
                              onStartSession(
                                selectedTrack.id,
                                action.id,
                                `${selectedTrack.name} · ${action.title}`
                              )
                            }
                            className="btn-secondary flex items-center gap-1.5 px-3 py-1 rounded type-l5 text-[#b8894f] hover:text-[var(--text-hero)] transition-all cursor-pointer font-medium"
                            title="开始此行动"
                          >
                            <span>开始</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onCompleteAction(action.id)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[#78998d] transition-colors rounded hover:bg-[#1c1916] cursor-pointer"
                            title="标记完成"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteAction(action.id)}
                            className="p-1.5 text-[var(--text-muted)] hover:text-[#c87a3e] transition-colors rounded hover:bg-[#1c1916] opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="删除行动"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Later / Backlog candidates */}
                {laterTrackActions.length > 0 && !isAddingAction && (
                  <div className="pt-3 border-t border-[#b8894f]/12 space-y-2">
                    <div className="type-l6 font-mono text-[var(--text-muted)] uppercase tracking-wider font-medium">
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
              <div className="space-y-7 pt-3">
                {/* RECENT TOUCHES Chapter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="type-l6 font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
                      RECENT TOUCHES / 最近发生
                    </span>
                    <span className="type-l6 font-mono text-[var(--text-muted)] text-[12px] font-medium">
                      {trackLogs.length}
                    </span>
                  </div>

                  {trackLogs.length === 0 ? (
                    <InlineEmptyState className="py-1.5" label="暂无记录" />
                  ) : (
                    <div className="space-y-1">
                      {trackLogs.map((l, lIdx) => (
                        <div
                          key={l.id}
                          className="py-1.5 flex items-start gap-3.5 text-left group hover:bg-[#181614]/40 px-1 -mx-1 rounded transition-colors"
                        >
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            {lIdx === 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#78998d]" title="最近推进" />
                            )}
                            <span className="type-l6 font-mono text-[#78998d] font-medium">
                              {formatLogDate(l.date)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="type-l4 text-[var(--text-primary)] leading-relaxed group-hover:text-[var(--text-hero)] transition-colors font-medium">
                              {l.content}
                            </span>
                          </div>
                          {l.duration_minutes && (
                            <span className="type-l6 font-mono text-[var(--text-muted)] shrink-0 font-medium">
                              {formatDuration(l.duration_minutes)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RESOURCES Chapter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="type-l6 font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
                      RESOURCES / 关联资源
                    </span>
                    <span className="type-l6 font-mono text-[var(--text-muted)] text-[12px] font-medium">
                      {relatedCards.length}
                    </span>
                  </div>

                  {relatedCards.length === 0 ? (
                    <InlineEmptyState className="py-1.5" label="暂无关联资源" />
                  ) : (
                    <div className="space-y-0.5">
                      {relatedCards.map(c => (
                        <button
                          key={c.id}
                          onClick={() => onOpenCard(c)}
                          className="w-full py-1.5 flex items-center justify-between text-left group hover:bg-[#181614]/40 px-1 -mx-1 rounded transition-colors cursor-pointer"
                        >
                          <span className="type-l4 text-[var(--text-primary)] group-hover:text-[var(--text-hero)] transition-colors truncate pr-4 font-medium">
                            {c.title}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[#b8894f] transition-colors shrink-0" />
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
                description="目标、阶段与 Next 会显示在这里。"
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
                <div className="flex gap-2">
                  {(['main', 'maintenance', 'paused'] as TrackRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewTrackRole(role)}
                      className={`flex-1 py-1.5 rounded type-l5 cursor-pointer font-medium ${
                        newTrackRole === role
                          ? `role-control ${role === 'main' ? 'is-main' : role === 'maintenance' ? 'is-maintenance' : 'is-paused'} font-semibold`
                          : 'role-control text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {role === 'main' ? '主线' : role === 'maintenance' ? '保温' : '暂缓'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">路线阶段</label>
                <p className="type-l6 text-[var(--text-ghost)] mb-1.5">用逗号分隔，建议 3–5 个阶段。</p>
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
                  className="px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="brass-button px-4 py-1.5 font-medium text-[var(--text-hero)] rounded cursor-pointer"
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
