import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Plus,
  Clock,
  Calendar,
  Compass,
  ArrowRight,
  StopCircle,
  Pause,
  Trash2
} from 'lucide-react';
import {
  ActiveSession,
  Card,
  LogEntry,
  NextAction,
  Phase,
  ScoredCandidate,
  Track
} from '../types';
import { EffortFilter, calculateStalenessDays } from '../lib/recommendation';
import { ChronographLedger } from './ChronographLedger';

interface TodayViewProps {
  currentDateStr: string;
  currentPhase?: Phase;
  tracks: Track[];
  actions: NextAction[];
  todayLogs: LogEntry[];
  pinnedCards: Card[];
  recommendations: ScoredCandidate[];
  activeSession: ActiveSession | null;
  effortFilter: EffortFilter;
  onSetEffortFilter: (filter: EffortFilter) => void;
  onShuffleRecommendations: () => void;
  onStartSession: (trackId: string, actionId?: string, title?: string) => void;
  onPauseResumeSession: () => void;
  onStopSession: (note?: string) => void;
  onCancelSession: () => void;
  onCompleteAction: (actionId: string) => void;
  onOpenLogModal: () => void;
  onOpenEndTodayModal: () => void;
  onOpenReentryModal: () => void;
  onOpenScoreExplanation: (candidate: ScoredCandidate) => void;
  onOpenCard: (card: Card) => void;
  onDeleteLog: (logId: string) => void;
  onSelectTrackView: () => void;
  onAddNextAction?: (trackId: string, title: string, effort: 'light' | 'normal' | 'deep') => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  currentDateStr,
  currentPhase,
  tracks,
  todayLogs,
  recommendations,
  activeSession,
  effortFilter,
  onSetEffortFilter,
  onShuffleRecommendations,
  onStartSession,
  onPauseResumeSession,
  onStopSession,
  onCancelSession,
  onCompleteAction,
  onOpenLogModal,
  onOpenEndTodayModal,
  onOpenReentryModal,
  onOpenScoreExplanation,
  onDeleteLog,
  onSelectTrackView,
  onAddNextAction,
}) => {
  // Chronometer live time
  const [nowTimeStr, setNowTimeStr] = useState<string>('');

  // Quick Add Next Action state for lightweight prompt
  const [showQuickAddNext, setShowQuickAddNext] = useState<boolean>(false);
  const [quickAddTitle, setQuickAddTitle] = useState<string>('');
  const [quickAddTrackId, setQuickAddTrackId] = useState<string>(
    tracks.find(t => t.role === 'main')?.id || tracks[0]?.id || ''
  );
  const [quickAddEffort, setQuickAddEffort] = useState<'light' | 'normal' | 'deep'>('normal');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setNowTimeStr(
        now.toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format today's human date string - Unique strong anchor
  const formatHeaderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return `${d.getMonth() + 1}月${d.getDate()}日 · ${weekDays[d.getDay()]}`;
    } catch {
      return dateStr;
    }
  };

  // Format active session elapsed seconds
  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h > 0) {
      return `${h}h ${String(remM).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    }
    return `${String(remM).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const primaryCandidate = recommendations[0];
  const secondaryCandidates = recommendations.slice(1, 3);

  return (
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[var(--text-primary)] p-6 lg:p-10">
      <div className="max-w-[880px] mx-auto space-y-9">
        {/* Top Header Zone: Date (Strongest Anchor), Real-time Chronometer, End Today */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#b8894f]/15 gap-4">
          <div>
            <div className="flex items-center gap-2 type-l6 font-mono text-[var(--text-muted)] tracking-wider uppercase mb-1 font-medium">
              <Compass className="w-3.5 h-3.5 text-[#b8894f]" />
              <span>CHRONOMETER / {nowTimeStr}</span>
            </div>
            <h1 className="type-l1 font-display font-semibold text-[var(--text-hero)]">
              {formatHeaderDate(currentDateStr)}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenReentryModal}
              className="btn-secondary px-3 py-1.5 rounded type-l5 text-[#78998d] hover:text-[#88a99d] flex items-center gap-1.5 cursor-pointer font-medium"
              title="数天未登录时的平稳接回模式"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#78998d]" />
              <span>接回视角</span>
            </button>

            <button
              onClick={onOpenEndTodayModal}
              className="brass-button px-4 py-1.5 rounded type-l5 font-medium text-[var(--text-primary)] hover:text-[var(--text-hero)] flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#c89a5a]" />
              <span>End today · 结束今天</span>
            </button>
          </div>
        </header>

        {/* Active Session Cockpit Bar (Visible when timer running - Level 3 Instrument Surface) */}
        {activeSession && (
          <section className="surface-instrument p-4 sm:p-5 rounded-lg relative overflow-hidden animate-fadeIn">
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="rivet" />
              <span className="rivet" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-[#141d19] border border-[rgba(120,153,141,0.35)] flex items-center justify-center shrink-0 shadow-inner">
                  <Clock className="w-6 h-6 text-[#78998d] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 type-l6 text-[#78998d] font-mono font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#78998d] shadow-[0_0_4px_rgba(120,153,141,0.5)] animate-pulse" />
                    <span>{activeSession.is_running ? 'RUNNING / 正在专注' : 'PAUSED / 暂停中'}</span>
                    <span>·</span>
                    <span className="font-semibold font-mono text-[var(--text-hero)]">{formatSeconds(activeSession.elapsed_seconds)}</span>
                    {!activeSession.is_running && (
                      <span className="text-[10.5px] px-1.5 py-0.2 bg-[#2d3d37] text-[#78998d] rounded font-mono font-medium">
                        PAUSED
                      </span>
                    )}
                  </div>
                  <h3 className="type-l3 font-semibold text-[var(--text-hero)] mt-0.5">
                    {activeSession.task_title}
                  </h3>
                  <div className="type-l6 text-[var(--text-muted)] font-sans font-medium">
                    所属主线: {tracks.find(t => t.id === activeSession.track_id)?.name || '未关联'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={onPauseResumeSession}
                  className="px-3 py-1.5 type-l5 font-medium rounded bg-[#251f18] hover:bg-[#30271e] border border-[#b8894f]/25 text-[var(--text-primary)] hover:text-[var(--text-hero)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {activeSession.is_running ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#c89a5a]" />
                      <span>暂停</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#78998d]" />
                      <span>继续</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onStopSession()}
                  className="brass-button px-4 py-1.5 type-l5 font-medium text-[var(--text-hero)] rounded flex items-center gap-1.5 cursor-pointer"
                >
                  <StopCircle className="w-3.5 h-3.5 text-[#c89a5a]" />
                  <span>停止并记入今日</span>
                </button>

                <button
                  onClick={onCancelSession}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[#e06c75] transition-colors rounded cursor-pointer"
                  title="放弃本次专注"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: "现在做什么？" (3-in-1 Recommendation System - Section Title Level) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <span>现在做什么？</span>
                <span className="type-l6 font-medium text-[#b8894f]">3 选 1 依据推荐</span>
              </h2>
              <p className="section-description">
                基于主线权重、停顿间隔、连续势头与复杂度透明算分
              </p>
            </div>

            {/* Effort & Filter switchers (Tactile instrument switches) */}
            <div className="flex items-center gap-1 p-0.5 bg-[#151412] rounded-[7px] border border-[#b8894f]/15 self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => onSetEffortFilter('all')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap cursor-pointer ${
                  effortFilter === 'all'
                    ? 'bg-[#252019] text-[var(--text-hero)] border border-[#b8894f]/35 shadow-2xs font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                默认
              </button>
              <button
                onClick={() => onSetEffortFilter('light')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap cursor-pointer ${
                  effortFilter === 'light'
                    ? 'bg-[rgba(120,153,141,0.16)] text-[#78998d] border border-[rgba(120,153,141,0.35)] shadow-2xs font-medium'
                    : 'text-[var(--text-muted)] hover:text-[#78998d]'
                }`}
              >
                只想做点轻的
              </button>
              <button
                onClick={() => onSetEffortFilter('normal')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap cursor-pointer ${
                  effortFilter === 'normal'
                    ? 'bg-[#252019] text-[var(--text-hero)] border border-[#b8894f]/35 shadow-2xs font-medium'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                正常
              </button>
              <button
                onClick={() => onSetEffortFilter('deep')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap cursor-pointer ${
                  effortFilter === 'deep'
                    ? 'bg-[rgba(200,122,62,0.16)] text-[#c87a3e] border border-[rgba(200,122,62,0.35)] shadow-2xs font-medium'
                    : 'text-[var(--text-muted)] hover:text-[#c87a3e]'
                }`}
              >
                想沉进去
              </button>
              <button
                onClick={onShuffleRecommendations}
                className="chip-semi-capsule type-l5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 border-l border-[#b8894f]/15 ml-0.5 pl-2 cursor-pointer font-medium"
                title="换一批候选"
              >
                <RotateCw className="w-3 h-3" />
                <span>换一批</span>
              </button>
            </div>
          </div>

          {/* Recommendations Content */}
          {recommendations.length === 0 ? (
            <div className="space-y-3">
              <div className="surface-flat p-4 sm:p-5 rounded-lg border border-[#b8894f]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[80px]">
                <div>
                  <h3 className="type-l4 font-medium text-[var(--text-primary)] mb-0.5">暂无可推荐的 Next</h3>
                  <div className="type-l5 text-[var(--text-secondary)] flex items-center gap-1.5 flex-wrap">
                    <span>当前主线还没有清晰的下一步。</span>
                    <button
                      onClick={onSelectTrackView}
                      className="text-[#b8894f] hover:underline inline-flex items-center gap-0.5 font-medium cursor-pointer"
                    >
                      去 Tracks 留下 1–3 个 Next <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {onAddNextAction && (
                  <button
                    onClick={() => setShowQuickAddNext(true)}
                    className="btn-secondary px-3.5 py-1.5 rounded type-l5 font-medium text-[var(--text-primary)] hover:text-[var(--text-hero)] flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#b8894f]" />
                    <span>快速新增</span>
                  </button>
                )}
              </div>

              {/* Inline Quick Add Next Action Form */}
              {showQuickAddNext && onAddNextAction && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!quickAddTitle.trim()) return;
                    onAddNextAction(quickAddTrackId, quickAddTitle.trim(), quickAddEffort);
                    setQuickAddTitle('');
                    setShowQuickAddNext(false);
                  }}
                  className="surface-featured p-4 rounded-lg border border-[#b8894f]/25 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="type-l6 font-mono text-[#b8894f] uppercase tracking-wider font-medium">
                      快速新增 Next 动作
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddNext(false)}
                      className="type-l6 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer font-medium"
                    >
                      取消
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      placeholder="可执行的小动作（如：读完第 2 章、写完 API 接口...）"
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      className="flex-1 bg-[#151412] border border-[#b8894f]/20 rounded px-3 py-1.5 type-l4 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f]"
                      autoFocus
                    />
                    <select
                      value={quickAddTrackId}
                      onChange={(e) => setQuickAddTrackId(e.target.value)}
                      className="bg-[#151412] border border-[#b8894f]/20 rounded px-2.5 py-1.5 type-l5 text-[var(--text-primary)] focus:outline-none focus:border-[#b8894f]"
                    >
                      {tracks.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.role === 'main' ? '主线' : t.role === 'maintenance' ? '保温' : '暂缓'})
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1">
                      {(['light', 'normal', 'deep'] as const).map(eff => (
                        <button
                          key={eff}
                          type="button"
                          onClick={() => setQuickAddEffort(eff)}
                          className={`px-2.5 py-1.5 rounded type-l6 transition-colors cursor-pointer ${
                            quickAddEffort === eff
                              ? eff === 'light'
                                ? 'tag-effort-light font-medium'
                                : eff === 'deep'
                                ? 'tag-effort-deep font-medium'
                                : 'tag-effort-normal font-medium'
                              : 'bg-[#151412] text-[var(--text-muted)] border border-[#b8894f]/15'
                          }`}
                        >
                          {eff === 'light' ? '轻量' : eff === 'normal' ? '正常' : '深入'}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="brass-button px-4 py-1.5 rounded type-l5 font-medium text-[var(--text-hero)] shrink-0 cursor-pointer"
                    >
                      保存
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Primary Anchor Candidate (Dominant visual weight - Level 2 Featured Surface) */}
              {primaryCandidate && (
                <div className="surface-featured p-5 sm:p-6 rounded-lg relative group shadow-sm">
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => onOpenScoreExplanation(primaryCandidate)}
                      className="type-l6 text-[var(--text-muted)] hover:text-[#b8894f] flex items-center gap-1 px-2 py-0.5 rounded bg-[#181614] border border-[#b8894f]/15 transition-colors cursor-pointer font-mono font-medium"
                      title="查看透明算分解释"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Score {primaryCandidate.score}</span>
                    </button>
                    <span className="rivet" />
                  </div>

                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex items-center gap-2 type-l5">
                      <span className="font-semibold font-display text-[#b8894f]">★ {primaryCandidate.track.name}</span>
                      <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                      <span className={`px-1.5 py-0.5 rounded type-l6 ${
                        primaryCandidate.action.effort === 'light'
                          ? 'tag-effort-light'
                          : primaryCandidate.action.effort === 'deep'
                          ? 'tag-effort-deep'
                          : 'tag-effort-normal'
                      }`}>
                        {primaryCandidate.action.effort === 'deep'
                          ? '深入'
                          : primaryCandidate.action.effort === 'normal'
                          ? '正常'
                          : '轻量'}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                      <span className="text-[var(--text-muted)] type-l6 font-medium">
                        {primaryCandidate.track.role === 'main'
                          ? '当前主线'
                          : primaryCandidate.track.role === 'maintenance'
                          ? '保温主线'
                          : '暂缓'}
                      </span>
                    </div>

                    <h3 className="type-l2 font-semibold text-[var(--text-hero)]">
                      {primaryCandidate.action.title}
                    </h3>

                    {primaryCandidate.action.note && (
                      <p className="type-l4 text-[var(--text-secondary)] leading-relaxed">
                        {primaryCandidate.action.note}
                      </p>
                    )}

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() =>
                          onStartSession(
                            primaryCandidate.track.id,
                            primaryCandidate.action.id,
                            `${primaryCandidate.track.name} · ${primaryCandidate.action.title}`
                          )
                        }
                        className="brass-button px-5 py-2 rounded type-l5 font-medium text-[var(--text-primary)] hover:text-[var(--text-hero)] flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#c89a5a]" />
                        <span>开始专注</span>
                      </button>

                      <button
                        onClick={() => onCompleteAction(primaryCandidate.action.id)}
                        className="btn-secondary px-3.5 py-2 rounded type-l5 text-[#78998d] hover:text-[#88a99d] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#78998d]" />
                        <span>直接标记完成</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary 2 Candidates (Level 1 Flat Surface) */}
              {secondaryCandidates.map(candidate => {
                const staleness = calculateStalenessDays(candidate.track.last_touched_at, currentDateStr);
                const stalenessText =
                  staleness === 0
                    ? '今天刚碰'
                    : staleness === 999
                    ? '暂无记录'
                    : `${staleness} 天没碰`;

                const effortBadgeClass =
                  candidate.action.effort === 'light'
                    ? 'tag-effort-light'
                    : candidate.action.effort === 'deep'
                    ? 'tag-effort-deep'
                    : 'tag-effort-normal';

                const effortText =
                  candidate.action.effort === 'light'
                    ? '轻量'
                    : candidate.action.effort === 'normal'
                    ? '正常'
                    : '深入';

                return (
                  <div
                    key={candidate.action.id}
                    className="surface-flat p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#b8894f]/25 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 type-l4 text-[var(--text-primary)]">
                        <span className="text-[#b8894f] font-medium">○ {candidate.track.name}</span>
                        <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                        <span className="text-[var(--text-primary)] font-medium">{candidate.action.title}</span>
                      </div>
                      <div className="type-l6 text-[var(--text-muted)] flex items-center gap-2 font-sans font-medium">
                        <span className={`px-1.5 py-0.2 rounded ${effortBadgeClass}`}>
                          {effortText}
                        </span>
                        <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                        <span className="font-mono text-[var(--text-muted)] font-medium">{stalenessText}</span>
                        {candidate.action.note && (
                          <>
                            <span aria-hidden="true" className="text-[var(--text-ghost)]">·</span>
                            <span className="truncate max-w-xs text-[var(--text-secondary)] font-normal">{candidate.action.note}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => onOpenScoreExplanation(candidate)}
                        className="p-1 text-[var(--text-muted)] hover:text-[#b8894f] type-l6 cursor-pointer font-medium"
                        title="查看算分"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          onStartSession(
                            candidate.track.id,
                            candidate.action.id,
                            `${candidate.track.name} · ${candidate.action.title}`
                          )
                        }
                        className="btn-secondary px-3 py-1.5 rounded type-l5 text-[var(--text-primary)] hover:text-[var(--text-hero)] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <Play className="w-3 h-3 text-[#b8894f]" />
                        <span>开始</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: "今天发生的现实" (Engineering Journal - Reality Timeline) */}
        <section className="space-y-4 pt-4 border-t border-[#b8894f]/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="section-title">
                今天发生的现实
              </h2>
              <p className="section-description">
                记录现实，而不是审计生活。生活可以被记录，但不必被管理。
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={onOpenLogModal}
                className="btn-secondary px-3 py-1.5 rounded type-l5 text-[var(--text-primary)] hover:text-[var(--text-hero)] flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <Plus className="w-3.5 h-3.5 text-[#b8894f]" />
                <span>记一下刚刚做了什么</span>
              </button>

              <button
                onClick={() => onStartSession('', undefined, '自由专注 Session')}
                className="brass-button px-3.5 py-1.5 rounded type-l5 font-medium text-[var(--text-primary)] hover:text-[var(--text-hero)] flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 text-[#c89a5a]" />
                <span>Start Session</span>
              </button>
            </div>
          </div>

          <ChronographLedger
            mode="live"
            entries={todayLogs}
            tracks={tracks}
            onDeleteLog={onDeleteLog}
            emptyMessage="今天还没有留下任何痕迹。"
            emptySubtext="完成了一段专注？或是刚刚散步打了一会游戏？都可以轻松记下一笔。"
            onOpenCreate={onOpenLogModal}
          />
        </section>

        {/* SECTION 3: Current Phase Minimalist Log Footer */}
        <section className="pt-8 pb-4 border-t border-[#b8894f]/15 space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <div className="type-l6 font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1 font-medium">
                CURRENT PHASE · 当前阶段
              </div>
              <h3 className="section-title">
                {currentPhase?.name || '探索期'}
              </h3>
              <p className="section-description">
                {currentPhase?.note || '一条主线 + 多条保温线'}
              </p>
            </div>
            <button
              onClick={onSelectTrackView}
              className="type-l5 text-[#b8894f] hover:text-[#c89a5a] transition-colors flex items-center gap-1 group py-1 cursor-pointer font-medium"
            >
              <span>管理主线</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-[#b8894f]/10 pt-1">
            {tracks.map(t => {
              const staleness = calculateStalenessDays(t.last_touched_at, currentDateStr);
              const isMain = t.role === 'main';
              const isMaint = t.role === 'maintenance';

              return (
                <div
                  key={t.id}
                  onClick={onSelectTrackView}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-[#181614]/50 rounded transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMain
                          ? 'bg-[#b8894f]'
                          : isMaint
                          ? 'border border-[#7a6b57]'
                          : 'border border-[#54483b]'
                      }`}
                    />
                    <span className="type-l4 font-medium text-[var(--text-primary)] group-hover:text-[var(--text-hero)] transition-colors">
                      {t.name}
                    </span>
                    <span className="type-l6 text-[var(--text-muted)] font-sans font-medium">
                      {isMain ? '主线' : isMaint ? '保温' : '暂缓'}
                    </span>
                  </div>

                  <div className="type-l6 font-mono font-medium">
                    {staleness === 0 ? (
                      <span className="text-[#b8894f] font-semibold">TODAY</span>
                    ) : staleness === 999 ? (
                      <span className="text-[var(--text-muted)]">—</span>
                    ) : (
                      <span className="text-[var(--text-muted)]">{staleness}d</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
