import React, { useState } from 'react';
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
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');
  const [newTrackRole, setNewTrackRole] = useState<TrackRole>('main');
  const [newTrackStages, setNewTrackStages] = useState('基础理解, 小 Demo, 完整项目, 求职包装');

  // Quick add Next action state
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [actionEffort, setActionEffort] = useState<'light' | 'normal' | 'deep'>('normal');

  const selectedTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];

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
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[#e6ddd0] p-6 lg:p-8">
      {/* 1. Main Container: Fixed 880px max-width for crisp desktop engineering dossier presence */}
      <div className="max-w-[880px] mx-auto space-y-8">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-5 border-b border-[#c69956]/20 gap-4">
          <div>
            <div className="type-l6 font-mono text-[#8e8273] tracking-wider uppercase mb-1">
              PHASE DIRECTION / 管方向，不管每天
            </div>
            <h1 className="text-[30px] leading-[36px] font-display font-bold text-[#f7f0e5] flex items-baseline gap-2.5">
              <span>主线脉络</span>
              <span className="type-l6 font-mono font-normal text-[#8e8273] tracking-widest">/ TRACKS</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={onOpenPhaseSettings}
              className="px-3 py-1.5 rounded type-l5 text-[#ded7cd] hover:text-[#f7f0e5] hover:bg-[#1a1714] border border-[#c69956]/20 transition-colors cursor-pointer"
            >
              当前阶段: <strong className="text-[#dfbf85] font-normal">{currentPhase?.name || '探索期'}</strong>
            </button>
            <button
              onClick={() => setShowAddTrackModal(true)}
              className="brass-button px-3.5 py-1.5 rounded type-l5 font-semibold text-[#fcf9f2] flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#dfbf85]" />
              <span>新建主线</span>
            </button>
          </div>
        </header>

        {/* 2. Main Two-Column Structure with 1px Subtle Vertical Dossier Divider */}
        <div className="flex flex-col md:flex-row gap-7 md:gap-8 items-start">
          {/* Left Column: Track Index / 主线目录 (180–200px, tight, aligned to right top) */}
          <nav className="w-full md:w-[190px] shrink-0 space-y-2 md:border-r md:border-[#c69956]/15 md:pr-7">
            <div className="type-l6 font-mono uppercase tracking-widest text-[#8e8273] px-2 pb-2 border-b border-[#c69956]/20 flex items-center justify-between">
              <span>ALL COURSES</span>
              <span className="text-[#8e8273] font-mono text-[11px] font-semibold">{tracks.length}</span>
            </div>

            <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-1 md:gap-0.5 pt-1">
              {tracks.map(t => {
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
                        ? 'border-l-[#d4ab6a] bg-transparent text-[#f7f0e5]'
                        : 'border-l-transparent bg-transparent text-[#b8ab9a] hover:text-[#ded7cd] hover:border-l-[#544b41]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-[7px] h-[7px] rounded-full shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#d4ab6a]'
                            : isMain
                            ? 'bg-[#826d4a]'
                            : 'bg-[#4a4033]'
                        }`}
                      />
                      <span className={`type-l4 truncate ${isSelected ? 'font-semibold text-[#f7f0e5]' : 'font-normal'}`}>
                        {t.name}
                      </span>
                    </div>

                    <div className="pl-3.5 type-l6 font-mono text-[#8e8273]">
                      {metaLine}
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Column: Track Dossier / 主线档案 (flex: 1, approx 620–650px) */}
          {selectedTrack ? (
            <div className="flex-1 min-w-0 space-y-8">
              {/* 3. Lightweight Dossier Header with subtle ambient warmth */}
              <div className="p-4 sm:p-5 rounded border border-[#c69956]/15 bg-gradient-to-b from-[#181512]/60 to-[#121110]/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5">
                  <div className="type-l6 font-mono text-[#8e8273] uppercase tracking-wider">
                    {getRoleHeaderKicker(selectedTrack.role)}
                  </div>

                  {/* Segmented Role Control */}
                  <div className="flex items-center gap-0.5 bg-[#141210]/70 p-0.5 rounded border border-[#c69956]/15 self-start sm:self-auto">
                    {(['main', 'maintenance', 'paused'] as TrackRole[]).map(role => (
                      <button
                        key={role}
                        onClick={() => onUpdateTrackRole(selectedTrack.id, role)}
                        className={`px-2.5 py-0.5 type-l6 font-mono rounded transition-colors cursor-pointer ${
                          selectedTrack.role === role
                            ? 'bg-[#282117] text-[#d4ab6a] border border-[#c69956]/30 shadow-2xs font-semibold'
                            : 'text-[#8e8273] hover:text-[#ded7cd]'
                        }`}
                      >
                        {role === 'main' ? '主线' : role === 'maintenance' ? '保温' : '暂缓'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track Title (24px) */}
                <h2 className="text-[24px] leading-tight font-display font-bold text-[#f7f0e5] tracking-tight">
                  {selectedTrack.name}
                </h2>

                {/* Purpose Paragraph */}
                <p className="type-l4 text-[#ded7cd] leading-relaxed max-w-2xl pt-1">
                  {selectedTrack.description || '暂无明确目标描述'}
                </p>
              </div>

              {/* 4. Roadmap Scale (High visibility precision mechanical instrument) */}
              <div className="space-y-3 pt-1">
                <div className="type-l6 font-mono text-[#8e8273] tracking-wider uppercase flex items-center justify-between pb-1">
                  <span>ROADMAP SCALE / 路线刻度</span>
                  <span className="text-[#8e8273] text-[11px] font-sans">点击刻度切换当前阶段</span>
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
                      const isFuture = idx > selectedTrack.current_stage_index;

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
                                ? 'text-[#86a69a]'
                                : isCurrent
                                ? 'text-[#d4ab6a] font-bold'
                                : 'text-[#736758] group-hover:text-[#a89b8a]'
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
                                    ? 'bg-[#557368]'
                                    : isCurrent
                                    ? 'bg-gradient-to-r from-[#d4ab6a] to-[#382e22]'
                                    : 'bg-[#28211a]'
                                }`}
                              />
                            )}

                            {/* Connecting Line from prev station */}
                            {idx > 0 && (
                              <div
                                className={`absolute left-0 right-[calc(100%-10px)] h-[2px] z-0 ${
                                  isCompleted || isCurrent
                                    ? 'bg-[#557368]'
                                    : 'bg-[#28211a]'
                                }`}
                              />
                            )}

                            {/* Station Node Marker */}
                            <span
                              className={`relative z-10 w-[20px] h-[20px] rounded-full flex items-center justify-center transition-all ${
                                isCompleted
                                  ? 'bg-[#14201c] border-2 border-[#557368] text-[#86a69a]'
                                  : isCurrent
                                  ? 'bg-[#292015] border-2 border-[#d4ab6a] text-[#f7f0e5] shadow-[0_0_10px_rgba(212,171,106,0.4)]'
                                  : 'bg-[#151311] border-2 border-[#3d3326] text-[#736758] group-hover:border-[#5c4e3b]'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-3 h-3 text-[#86a69a] stroke-[2.5]" />
                              ) : isCurrent ? (
                                <span className="w-2 h-2 rounded-full bg-[#d4ab6a]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#3d3326] group-hover:bg-[#5c4e3b]" />
                              )}
                            </span>
                          </div>

                          {/* Bottom: Stage Label & Current Indicator */}
                          <div className="space-y-0.5">
                            <div
                              className={`type-l5 leading-snug transition-colors ${
                                isCompleted
                                  ? 'text-[#86a69a]'
                                  : isCurrent
                                  ? 'text-[#f7f0e5] font-semibold'
                                  : 'text-[#8e8273] group-hover:text-[#ded7cd]'
                              }`}
                            >
                              {stage}
                            </div>
                            {isCurrent && (
                              <div className="type-l6 font-mono text-[#d4ab6a] tracking-wider text-[10px] uppercase font-semibold">
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

              {/* 5. NEXT ACTIONS (Primary dossier operational section, clean row dividers) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#c69956]/20">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="type-l6 font-mono uppercase tracking-wider text-[#b8ab9a]">
                        {isAddingAction ? 'NEXT ACTIONS / 正在新增' : 'NEXT ACTIONS / 接下来行动'}
                      </span>
                    </div>
                    <p className="type-l6 text-[#8e8273] mt-0.5">
                      {isAddingAction ? '填写当前最容易启动的第一步' : '最多 1–3 个，保持近处清楚'}
                    </p>
                  </div>

                  {!isAddingAction && (
                    <button
                      onClick={() => setIsAddingAction(true)}
                      className="flex items-center gap-1.5 type-l5 text-[#d4ab6a] hover:text-[#f7f0e5] transition-colors py-1 px-2.5 rounded hover:bg-[#1a1714] border border-[#c69956]/25 hover:border-[#c69956]/40 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新增</span>
                    </button>
                  )}
                </div>

                {/* Mutually Exclusive 3 States (No floating popup, in-place replacing) */}
                {isAddingAction ? (
                  /* 6. Creating State: In-place Recessed Form */
                  <form
                    onSubmit={handleCreateAction}
                    className="p-4 rounded border border-[#c69956]/25 bg-[#141210]/90 space-y-3.5 shadow-xs"
                  >
                    <div className="space-y-1">
                      <label className="type-l6 font-mono uppercase text-[#b8ab9a] block">
                        下一步行动
                      </label>
                      <input
                        type="text"
                        placeholder="如：跑一个最小 MCP Server"
                        value={actionTitle}
                        onChange={e => setActionTitle(e.target.value)}
                        className="w-full bg-[#0d0c0b] border border-[#c69956]/30 rounded px-3 py-1.5 type-l5 text-[#f7f0e5] focus:outline-hidden focus:border-[#d4ab6a]"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="type-l6 font-mono uppercase text-[#b8ab9a] block">
                        备注 / 上下文 (可选)
                      </label>
                      <input
                        type="text"
                        placeholder="如：昨天刚完成 tool calling，继续这里上下文最完整"
                        value={actionNote}
                        onChange={e => setActionNote(e.target.value)}
                        className="w-full bg-[#0d0c0b] border border-[#c69956]/30 rounded px-3 py-1.5 type-l5 text-[#ded7cd] focus:outline-hidden focus:border-[#d4ab6a]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2 type-l5">
                        <span className="text-[#b8ab9a] type-l6 font-mono uppercase">EFFORT:</span>
                        {(['light', 'normal', 'deep'] as const).map(eff => (
                          <button
                            key={eff}
                            type="button"
                            onClick={() => setActionEffort(eff)}
                            className={`px-2.5 py-1 rounded type-l6 font-mono transition-colors cursor-pointer ${
                              actionEffort === eff
                                ? eff === 'light'
                                  ? 'bg-[#17231f] text-[#86a69a] border border-[#4a635a] font-semibold'
                                  : eff === 'normal'
                                  ? 'bg-[#282015] text-[#d4ab6a] border border-[#8a6a3b] font-semibold'
                                  : 'bg-[#291b14] text-[#c87a3e] border border-[#8a4e29] font-semibold'
                                : 'text-[#8e8273] hover:text-[#ded7cd]'
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
                          className="px-3 py-1 type-l5 text-[#8e8273] hover:text-[#ded7cd] cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          className="brass-button px-4 py-1 type-l5 font-semibold text-[#fcf9f2] rounded cursor-pointer"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  </form>
                ) : activeTrackActions.length === 0 ? (
                  /* State A: Clean Empty State without duplicate CTA button */
                  <div className="py-4 space-y-1 text-left">
                    <div className="type-l4 text-[#f7f0e5] font-medium">暂无清晰 Next</div>
                    <p className="type-l5 text-[#b8ab9a]">
                      先留下当前最确定、最容易启动的一步。
                    </p>
                  </div>
                ) : (
                  /* State C: Active Next Rows */
                  <div className="divide-y divide-[#c69956]/15">
                    {activeTrackActions.map((action, idx) => (
                      <div
                        key={action.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors hover:bg-[#151311]/40 px-2 -mx-2 rounded"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <span className="type-l6 font-mono text-[#b8ab9a] pt-0.5 shrink-0 select-none font-medium">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="space-y-1 min-w-0">
                            <div className="type-l4 font-medium text-[#f7f0e5] group-hover:text-white transition-colors">
                              {action.title}
                            </div>
                            {action.note && (
                              <p className="type-l5 text-[#ded7cd] leading-relaxed">
                                {action.note}
                              </p>
                            )}
                            <div className="flex items-center gap-2 type-l6 text-[#8e8273]">
                              <span
                                className={
                                  action.effort === 'deep'
                                    ? 'text-[#c87a3e] font-medium'
                                    : action.effort === 'normal'
                                    ? 'text-[#d4ab6a] font-medium'
                                    : 'text-[#86a69a] font-medium'
                                }
                              >
                                {action.effort === 'deep'
                                  ? '深入'
                                  : action.effort === 'normal'
                                  ? '正常'
                                  : '轻量'}
                              </span>
                              <span className="text-[#544b41]" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-[#b8ab9a]">
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
                            className="flex items-center gap-1.5 px-3 py-1 rounded type-l5 text-[#d4ab6a] hover:text-[#f7f0e5] hover:bg-[#221c16] border border-[#c69956]/20 transition-all cursor-pointer"
                            title="开始此行动"
                          >
                            <span>开始</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onCompleteAction(action.id)}
                            className="p-1.5 text-[#8e8273] hover:text-[#86a69a] transition-colors rounded hover:bg-[#1a1714] cursor-pointer"
                            title="标记完成"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteAction(action.id)}
                            className="p-1.5 text-[#544b41] hover:text-[#c87a3e] transition-colors rounded hover:bg-[#1a1714] opacity-0 group-hover:opacity-100 cursor-pointer"
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
                  <div className="pt-3 border-t border-[#c69956]/15 space-y-2">
                    <div className="type-l6 font-mono text-[#b8ab9a] uppercase tracking-wider">
                      LATER / 后续候选
                    </div>
                    <div className="space-y-1.5">
                      {laterTrackActions.map(action => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between type-l5 text-[#ded7cd] py-1 px-2 rounded hover:bg-[#151311]/40"
                        >
                          <span>{action.title}</span>
                          <span className="type-l6 font-mono text-[#8e8273]">
                            {action.effort === 'deep' ? '深入' : action.effort === 'normal' ? '正常' : '轻量'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Recent Touches & Resources Sections (Forming cohesive back-half of dossier) */}
              <div className="space-y-6 pt-2">
                {/* RECENT TOUCHES Chapter */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#c69956]/20">
                    <span className="type-l6 font-mono uppercase tracking-wider text-[#b8ab9a] font-medium">
                      RECENT TOUCHES / 最近发生
                    </span>
                    <span className="type-l6 font-mono text-[#b8ab9a] text-[11px] font-semibold">
                      {trackLogs.length}
                    </span>
                  </div>

                  {trackLogs.length === 0 ? (
                    <div className="type-l5 text-[#b8ab9a] py-2 font-sans">
                      暂无主线记录
                    </div>
                  ) : (
                    <div className="divide-y divide-[#c69956]/10">
                      {trackLogs.map((l, lIdx) => (
                        <div
                          key={l.id}
                          className="py-2.5 flex items-start gap-3.5 text-left group hover:bg-[#151311]/30 px-1 -mx-1 rounded transition-colors"
                        >
                          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                            {lIdx === 0 && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#86a69a]" title="最近推进" />
                            )}
                            <span className="type-l6 font-mono text-[#86a69a] font-medium">
                              {formatLogDate(l.date)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="type-l4 text-[#f7f0e5] leading-relaxed group-hover:text-white transition-colors">
                              {l.content}
                            </span>
                          </div>
                          {l.duration_minutes && (
                            <span className="type-l6 font-mono text-[#b8ab9a] shrink-0">
                              {formatDuration(l.duration_minutes)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RESOURCES Chapter */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#c69956]/20">
                    <span className="type-l6 font-mono uppercase tracking-wider text-[#b8ab9a] font-medium">
                      RESOURCES / 关联资源
                    </span>
                    <span className="type-l6 font-mono text-[#b8ab9a] text-[11px] font-semibold">
                      {relatedCards.length}
                    </span>
                  </div>

                  {relatedCards.length === 0 ? (
                    <div className="type-l5 text-[#b8ab9a] py-2 font-sans">
                      暂无关联资源
                    </div>
                  ) : (
                    <div className="divide-y divide-[#c69956]/10">
                      {relatedCards.map(c => (
                        <button
                          key={c.id}
                          onClick={() => onOpenCard(c)}
                          className="w-full py-2.5 flex items-center justify-between text-left group hover:bg-[#151311]/30 px-1 -mx-1 rounded transition-colors border-b border-transparent hover:border-b-[#c69956]/20 cursor-pointer"
                        >
                          <span className="type-l4 text-[#f7f0e5] group-hover:text-white transition-colors truncate pr-4">
                            {c.title}
                          </span>
                          <ArrowUpRight className="w-4 h-4 text-[#b8ab9a] group-hover:text-[#d4ab6a] transition-colors shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 py-12 text-center text-[#8e8273] type-l4">
              请选择或新建一条主线
            </div>
          )}
        </div>
      </div>

      {/* Add Track Modal */}
      {showAddTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="brass-panel-elevated p-6 rounded-lg max-w-md w-full space-y-4 border border-[#c69956]/40 shadow-2xl">
            <h3 className="font-display text-lg font-bold text-[#f7f2ea]">
              新建探索主线
            </h3>
            <form onSubmit={handleCreateTrack} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9c9183] mb-1">主线名称</label>
                <input
                  type="text"
                  placeholder="如: Agent / AI, 算法, Linux/C"
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[#f7f2ea] focus:outline-hidden focus:border-[#dfbf85]"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[#9c9183] mb-1">做它是为了什么 (核心目的)</label>
                <textarea
                  placeholder="如: 掌握现代 Agent 开发，并形成一个可以用于求职展示的项目。"
                  value={newTrackDesc}
                  onChange={e => setNewTrackDesc(e.target.value)}
                  className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[#f7f2ea] focus:outline-hidden focus:border-[#dfbf85] h-20"
                />
              </div>

              <div>
                <label className="block text-[#9c9183] mb-1">当前角色</label>
                <div className="flex gap-2">
                  {(['main', 'maintenance', 'paused'] as TrackRole[]).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setNewTrackRole(role)}
                      className={`flex-1 py-1.5 rounded text-xs cursor-pointer ${
                        newTrackRole === role
                          ? 'bg-[#2d241b] text-[#f7f2ea] border border-[#c69956]/40'
                          : 'bg-[#181512] text-[#8e8273]'
                      }`}
                    >
                      {role === 'main' ? '主线' : role === 'maintenance' ? '保温' : '暂缓'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#9c9183] mb-1">粗粒度阶段 (以逗号分隔)</label>
                <input
                  type="text"
                  value={newTrackStages}
                  onChange={e => setNewTrackStages(e.target.value)}
                  className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[#f7f2ea] focus:outline-hidden focus:border-[#dfbf85]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTrackModal(false)}
                  className="px-3 py-1.5 text-[#8e8273] hover:text-[#ded7cd] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="brass-button px-4 py-1.5 font-semibold text-[#fcf9f2] rounded cursor-pointer"
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
