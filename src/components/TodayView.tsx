import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  HelpCircle,
  RotateCw,
  Plus,
  Clock,
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  StopCircle,
  Pause,
  Trash2,
  ExternalLink,
  ChevronRight
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
  pinnedCards,
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
  onOpenCard,
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

  // Format today's human date string
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
    <div className="flex-1 overflow-y-auto min-h-screen bg-transparent text-[#e6ddd0] p-6 lg:p-10">
      <div className="max-w-[880px] mx-auto space-y-9">
        {/* Top Header Zone: Date, Real-time Chronometer, End Today */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#c69956]/20 gap-4">
          <div>
            <div className="flex items-center gap-2 type-l6 font-mono text-[#82776b] tracking-wider uppercase mb-1">
              <Compass className="w-3.5 h-3.5 text-[#b98a4a]" />
              <span>CHRONOMETER / {nowTimeStr}</span>
            </div>
            <h1 className="type-l1 font-display font-bold text-[#f7f0e5]">
              {formatHeaderDate(currentDateStr)}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenReentryModal}
              className="px-3 py-1.5 rounded type-l5 text-[#86a69a] hover:text-[#a8c9be] hover:bg-[rgba(107,135,124,0.12)] border border-[rgba(107,135,124,0.3)] transition-all flex items-center gap-1.5"
              title="数天未登录时的平稳接回模式"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#86a69a]" />
              <span>接回视角</span>
            </button>

            <button
              onClick={onOpenEndTodayModal}
              className="brass-button px-4 py-1.5 rounded type-l5 font-semibold text-[#f8f4ec] flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5 text-[#e6c17d]" />
              <span>End today · 结束今天</span>
            </button>
          </div>
        </header>

        {/* Active Session Cockpit Bar (Visible when timer running - Level 3 Elevation) */}
        {activeSession && (
          <section className="surface-instrument p-4 sm:p-5 rounded-lg border border-[rgba(107,135,124,0.45)] shadow-xl relative overflow-hidden animate-fadeIn">
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="rivet" />
              <span className="rivet" />
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-[#141d19] border border-[rgba(107,135,124,0.4)] flex items-center justify-center shrink-0 shadow-inner">
                  <Clock className="w-6 h-6 text-[#86a69a] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 type-l6 text-[#86a69a] font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#86a69a] shadow-[0_0_5px_rgba(134,166,154,0.6)] animate-pulse" />
                    <span>{activeSession.is_running ? 'RUNNING / 正在专注' : 'PAUSED / 暂停中'}</span>
                    <span>·</span>
                    <span className="font-semibold font-mono text-[#f7f0e5]">{formatSeconds(activeSession.elapsed_seconds)}</span>
                    {!activeSession.is_running && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#2d3d37] text-[#86a69a] rounded font-mono">
                        PAUSED
                      </span>
                    )}
                  </div>
                  <h3 className="type-l3 font-semibold text-[#f7f2ea] mt-0.5">
                    {activeSession.task_title}
                  </h3>
                  <div className="type-l6 text-[#82776b] font-sans">
                    所属主线: {tracks.find(t => t.id === activeSession.track_id)?.name || '未关联'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={onPauseResumeSession}
                  className="px-3 py-1.5 type-l5 rounded bg-[#2a2219] hover:bg-[#352b1f] border border-[#c69956]/30 text-[#ded7cd] transition-colors flex items-center gap-1.5"
                >
                  {activeSession.is_running ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-[#dfbf85]" />
                      <span>暂停</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-[#dfbf85]" />
                      <span>继续</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onStopSession()}
                  className="brass-button px-4 py-1.5 type-l5 font-semibold text-[#fcf9f2] rounded flex items-center gap-1.5"
                >
                  <StopCircle className="w-3.5 h-3.5 text-[#dfbf85]" />
                  <span>停止并记入今日</span>
                </button>

                <button
                  onClick={onCancelSession}
                  className="p-1.5 text-[#8a7d6d] hover:text-[#e06c75] transition-colors rounded"
                  title="放弃本次专注"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: "现在做什么？" (3-in-1 Recommendation System) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="type-l3 font-bold text-[#f4efe6] flex items-center gap-2">
                <span>现在做什么？</span>
                <span className="type-l6 font-normal text-[#c69956]/80">3 选 1 依据推荐</span>
              </h2>
              <p className="type-l6 text-[#9c9183] font-sans mt-0.5">
                基于主线权重、停顿间隔、连续势头与复杂度透明算分
              </p>
            </div>

            {/* Effort & Filter switchers (Tactile instrument switches) */}
            <div className="flex items-center gap-1 p-1 bg-[#141210] rounded-[9px] border border-[#c69956]/20 self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                onClick={() => onSetEffortFilter('all')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap ${
                  effortFilter === 'all'
                    ? 'bg-[#2a2219] text-[#f7f2ea] border border-[#c69956]/40 shadow-sm font-medium'
                    : 'text-[#9c9183] hover:text-[#dfbf85]'
                }`}
              >
                默认
              </button>
              <button
                onClick={() => onSetEffortFilter('light')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap ${
                  effortFilter === 'light'
                    ? 'bg-[rgba(107,135,124,0.18)] text-[#86a69a] border border-[rgba(107,135,124,0.4)] shadow-xs font-medium'
                    : 'text-[#82776b] hover:text-[#86a69a]'
                }`}
              >
                只想做点轻的
              </button>
              <button
                onClick={() => onSetEffortFilter('normal')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap ${
                  effortFilter === 'normal'
                    ? 'bg-[#2a2219] text-[#f7f2ea] border border-[#c69956]/40 shadow-sm font-medium'
                    : 'text-[#9c9183] hover:text-[#dfbf85]'
                }`}
              >
                正常
              </button>
              <button
                onClick={() => onSetEffortFilter('deep')}
                className={`chip-semi-capsule type-l5 whitespace-nowrap ${
                  effortFilter === 'deep'
                    ? 'bg-[rgba(200,122,62,0.18)] text-[#e89c65] border border-[rgba(200,122,62,0.4)] shadow-sm font-medium'
                    : 'text-[#9c9183] hover:text-[#e89c65]'
                }`}
              >
                想沉进去
              </button>
              <button
                onClick={onShuffleRecommendations}
                className="chip-semi-capsule type-l5 text-[#9c9183] hover:text-[#dfbf85] transition-colors flex items-center gap-1 border-l border-[#c69956]/20 ml-0.5 pl-2.5"
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
              <div className="surface-flat p-4 sm:p-5 rounded-lg border border-[#c69956]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[80px]">
                <div>
                  <h3 className="type-l4 font-bold text-[#ded7cd] mb-0.5">暂无可推荐的 Next</h3>
                  <div className="type-l5 text-[#8a7f72] flex items-center gap-1.5 flex-wrap">
                    <span>当前主线还没有清晰的下一步。</span>
                    <button
                      onClick={onSelectTrackView}
                      className="text-[#dfbf85] hover:underline inline-flex items-center gap-0.5 font-medium"
                    >
                      去 Tracks 留下 1–3 个 Next <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {onAddNextAction && (
                  <button
                    onClick={() => setShowQuickAddNext(true)}
                    className="brass-button px-3.5 py-1.5 rounded type-l5 font-semibold text-[#fcf9f2] flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#dfbf85]" />
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
                  className="surface-featured p-4 rounded-lg border border-[#c69956]/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="type-l6 font-mono text-[#c69956] uppercase tracking-wider">
                      快速新增 Next 动作
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddNext(false)}
                      className="type-l6 text-[#8a7f72] hover:text-[#ded7cd]"
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
                      className="flex-1 bg-[#181512] border border-[#c69956]/25 rounded px-3 py-1.5 type-l4 text-[#f7f2ea] focus:outline-none focus:border-[#dfbf85]"
                      autoFocus
                    />
                    <select
                      value={quickAddTrackId}
                      onChange={(e) => setQuickAddTrackId(e.target.value)}
                      className="bg-[#181512] border border-[#c69956]/25 rounded px-2.5 py-1.5 type-l5 text-[#ded7cd] focus:outline-none focus:border-[#dfbf85]"
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
                          className={`px-2.5 py-1.5 rounded type-l6 transition-colors ${
                            quickAddEffort === eff
                              ? eff === 'light'
                                ? 'tag-effort-light font-medium'
                                : eff === 'deep'
                                ? 'tag-effort-deep font-medium'
                                : 'tag-effort-normal font-medium'
                              : 'bg-[#181512] text-[#8a7f72] border border-[#c69956]/15'
                          }`}
                        >
                          {eff === 'light' ? '轻量' : eff === 'normal' ? '正常' : '深入'}
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="brass-button px-4 py-1.5 rounded type-l5 font-semibold text-[#fcf9f2] shrink-0"
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
                <div className="surface-featured p-5 sm:p-6 rounded-lg relative group shadow-md">
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => onOpenScoreExplanation(primaryCandidate)}
                      className="type-l6 text-[#c69956]/80 hover:text-[#f4d193] flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e1913] border border-[#c69956]/20 transition-colors"
                      title="查看透明算分解释"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Score {primaryCandidate.score}</span>
                    </button>
                    <span className="rivet" />
                  </div>

                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2 type-l5">
                      <span className="font-semibold font-display text-[#c69956]">★ {primaryCandidate.track.name}</span>
                      <span aria-hidden="true" className="text-[#594e3f]">·</span>
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
                      <span aria-hidden="true" className="text-[#594e3f]">·</span>
                      <span className="text-[#8a7f72] type-l6">
                        {primaryCandidate.track.role === 'main'
                          ? '当前主线'
                          : primaryCandidate.track.role === 'maintenance'
                          ? '保温主线'
                          : '暂缓'}
                      </span>
                    </div>

                    <h3 className="type-l2 font-bold text-[#fdfaf3]">
                      {primaryCandidate.action.title}
                    </h3>

                    {primaryCandidate.action.note && (
                      <p className="type-l4 text-[#b8ada0] leading-relaxed">
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
                        className="brass-button px-5 py-2 rounded type-l5 font-semibold text-[#fcf9f2] flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 text-[#dfbf85]" />
                        <span>开始专注</span>
                      </button>

                      <button
                        onClick={() => onCompleteAction(primaryCandidate.action.id)}
                        className="px-3 py-2 rounded type-l5 text-[#86a69a] hover:text-[#a8c9be] hover:bg-[rgba(107,135,124,0.12)] border border-[rgba(107,135,124,0.3)] transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#86a69a]" />
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
                    className="surface-flat p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#c69956]/35 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 type-l4 text-[#ded7cd]">
                        <span className="text-[#c69956] font-medium">○ {candidate.track.name}</span>
                        <span aria-hidden="true" className="text-[#594e3f]">·</span>
                        <span className="text-[#f7f2ea] font-medium">{candidate.action.title}</span>
                      </div>
                      <div className="type-l6 text-[#8a7f72] flex items-center gap-2 font-sans">
                        <span className={`px-1.5 py-0.2 rounded ${effortBadgeClass}`}>
                          {effortText}
                        </span>
                        <span aria-hidden="true" className="text-[#594e3f]">·</span>
                        <span className="font-mono text-[#8a7f72]">{stalenessText}</span>
                        {candidate.action.note && (
                          <>
                            <span aria-hidden="true" className="text-[#594e3f]">·</span>
                            <span className="truncate max-w-xs">{candidate.action.note}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        onClick={() => onOpenScoreExplanation(candidate)}
                        className="p-1 text-[#8a7f72] hover:text-[#dfbf85] type-l6"
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
                        className="px-3 py-1.5 rounded type-l5 text-[#e6c17d] bg-[#221c16] hover:bg-[#2e261d] border border-[#c69956]/30 transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3" />
                        <span>开始</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: "今天" (Daily Ledger - Reality Timeline) */}
        <section className="space-y-4 pt-4 border-t border-[#c69956]/15">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="type-l3 font-bold text-[#f4efe6]">
                今天发生的现实
              </h2>
              <p className="type-l6 text-[#9c9183] font-sans mt-0.5">
                记录现实，而不是审计生活。生活可以被记录，但不必被管理。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogModal}
                className="px-3 py-1.5 rounded type-l5 text-[#dfbf85] hover:bg-[#251f18] border border-[#c69956]/30 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>记一下刚刚做了什么</span>
              </button>

              <button
                onClick={() => onStartSession('', undefined, '自由专注 Session')}
                className="brass-button px-3 py-1.5 rounded type-l5 font-medium text-[#fcf9f2] flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-[#dfbf85]" />
                <span>Start Session</span>
              </button>
            </div>
          </div>

          {todayLogs.length === 0 ? (
            <div className="surface-flat p-8 rounded-lg text-center space-y-3 border border-[#c69956]/20">
              <Clock className="w-8 h-8 text-[#544838] mx-auto" />
              <p className="type-l4 text-[#a89b8a]">今天还没有留下任何痕迹。</p>
              <p className="type-l6 text-[#7d7162] font-sans">
                完成了一段小练习？或是刚刚散步打了一会游戏？都可以轻松记下一笔。
              </p>
              <button
                onClick={onOpenLogModal}
                className="brass-button px-4 py-1.5 type-l5 text-[#f7f2ea] rounded inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#dfbf85]" />
                <span>留下第一笔记录</span>
              </button>
            </div>
          ) : (
            <div className="space-y-0 py-1">
              {todayLogs.map((log, idx) => {
                const track = tracks.find(t => t.id === log.track_id);
                const isSession = log.type === 'session';
                const isFirst = idx === 0;
                const isLast = idx === todayLogs.length - 1;

                return (
                  <div key={log.id} className="relative flex items-stretch gap-3 sm:gap-4 group">
                    {/* Left Column: Timestamp */}
                    <div className="w-16 sm:w-28 text-right shrink-0 type-l6 font-mono text-[#82776b] select-none pt-2.5">
                      {log.started_at ? (
                        <span>
                          {log.started_at}
                          {log.ended_at && (
                            <span className="hidden sm:inline text-[#5f574e]"> ─ {log.ended_at}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[#473e34] tracking-widest">····</span>
                      )}
                    </div>

                    {/* Center Column: Perfectly Centered Vertical Guide Rail & Precision Node */}
                    <div className="relative flex flex-col items-center shrink-0 w-4">
                      {/* Top rail connector */}
                      <div className={`w-[1px] flex-1 ${isFirst ? 'bg-transparent' : 'bg-[#c69956]/20'}`} />

                      {/* Node */}
                      <div
                        className={`w-2 h-2 rounded-full border shrink-0 my-1 transition-transform group-hover:scale-125 ${
                          isSession
                            ? 'border-[#8f6e3c] bg-[#ba9258] shadow-[0_0_3.5px_rgba(198,153,86,0.20)]'
                            : 'border-[#4a4239] bg-[#141210]'
                        }`}
                      />

                      {/* Bottom rail connector */}
                      <div className={`w-[1px] flex-1 ${isLast ? 'bg-transparent' : 'bg-[#c69956]/20'}`} />
                    </div>

                    {/* Right Column: Engineering Log Entry (No Box, pure typography & baseline rule) */}
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#c69956]/10 py-2.5 group-hover:border-[#c69956]/25 transition-colors">
                      <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                        <span
                          className={`type-l5 shrink-0 ${
                            track ? 'text-[#d4ab6a] font-medium' : 'text-[#5f574e] font-normal'
                          }`}
                        >
                          [{track ? track.name : '随手记'}]
                        </span>
                        <span className="type-l4 text-[#e6ddd0] leading-relaxed break-words">
                          {log.content}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        {log.duration_minutes && (
                          <span className="type-l6 font-mono text-[#82776b] bg-[#161412] px-1.5 py-0.5 rounded border border-[#2e271f]">
                            {log.duration_minutes >= 60
                              ? `${Math.floor(log.duration_minutes / 60)}h ${
                                  log.duration_minutes % 60 > 0 ? `${log.duration_minutes % 60}m` : ''
                                }`
                              : `${log.duration_minutes}m`}
                          </span>
                        )}

                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#8a7f72] hover:text-[#e06c75]"
                          title="删除该记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: Current Phase Minimalist Log Footer */}
        <section className="pt-8 pb-4 border-t border-[#c69956]/15 space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <div className="type-l6 font-mono text-[#c69956]/80 uppercase tracking-widest mb-1">
                CURRENT PHASE · 当前阶段
              </div>
              <h3 className="type-l3 font-bold text-[#f7f2ea]">
                {currentPhase?.name || '探索期'}
              </h3>
              <p className="type-l5 text-[#8a7f72] font-sans mt-0.5">
                {currentPhase?.note || '一条主线 + 多条保温线'}
              </p>
            </div>
            <button
              onClick={onSelectTrackView}
              className="type-l5 text-[#c69956] hover:text-[#f4d193] transition-colors flex items-center gap-1 group py-1"
            >
              <span>管理主线</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-[#c69956]/10 pt-1">
            {tracks.map(t => {
              const staleness = calculateStalenessDays(t.last_touched_at, currentDateStr);
              const isMain = t.role === 'main';
              const isMaint = t.role === 'maintenance';

              return (
                <div
                  key={t.id}
                  onClick={onSelectTrackView}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-[#181512]/60 rounded transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMain
                          ? 'bg-[#b38f56]'
                          : isMaint
                          ? 'border border-[#6b6255]'
                          : 'border border-[#453c30]'
                      }`}
                    />
                    <span className="type-l4 font-medium text-[#f2ede4] group-hover:text-[#dfbf85] transition-colors">
                      {t.name}
                    </span>
                    <span className="type-l6 text-[#8a7f72] font-sans">
                      {isMain ? '主线' : isMaint ? '保温' : '暂缓'}
                    </span>
                  </div>

                  <div className="type-l6 font-mono">
                    {staleness === 0 ? (
                      <span className="text-[#dfbf85] font-semibold">TODAY</span>
                    ) : staleness === 999 ? (
                      <span className="text-[#594e3f]">—</span>
                    ) : (
                      <span className="text-[#8a7f72]">{staleness}d</span>
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
