import React, { useState } from 'react';
import { RotateCw, X, Play, ArrowRight, Compass } from 'lucide-react';
import { NextAction, ScoredCandidate, Track } from '../../types';
import { calculateStalenessDays } from '../../lib/recommendation';

interface ReentryModalProps {
  currentDateStr: string;
  tracks: Track[];
  actions: NextAction[];
  recommendations: ScoredCandidate[];
  onClose: () => void;
  onStartSession: (trackId: string, actionId?: string, title?: string) => void;
  onRecordReentryNote: (note: string) => void;
}

export const ReentryModal: React.FC<ReentryModalProps> = ({
  currentDateStr,
  tracks,
  actions,
  recommendations,
  onClose,
  onStartSession,
  onRecordReentryNote,
}) => {
  const [reentryNote, setReentryNote] = useState('');

  const activeTracks = tracks.filter(t => t.status === 'active');

  const handleConfirm = () => {
    if (reentryNote.trim()) {
      onRecordReentryNote(reentryNote.trim());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="brass-panel-elevated p-6 sm:p-7 rounded-lg max-w-xl w-full space-y-6 border border-[#c69956]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#86a69a]" />
            <h3 className="font-display text-xl font-bold text-[var(--text-hero)]">
              欢迎回来 · 平稳接回现实
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            无论停顿了几天，没有逾期账单，没有完成率扣分。随时从这里接回上下文。
          </p>
        </div>

        {/* Where you stopped */}
        <div className="brass-panel p-4 rounded-lg space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            上次你停在
          </div>

          <div className="space-y-2.5">
            {activeTracks.map(t => {
              const staleness = calculateStalenessDays(t.last_touched_at, currentDateStr);
              const trackNext = actions.find(a => a.track_id === t.id && a.status === 'active');

              return (
                <div key={t.id} className="text-xs flex items-baseline justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[var(--text-hero)] flex items-center gap-2">
                      <span>{t.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {staleness === 0 ? '今天已碰' : staleness === 999 ? '未触达' : `${staleness} 天前`}
                      </span>
                    </div>
                    {trackNext && (
                      <div className="text-[var(--text-secondary)] text-[11px]">
                        ↳ Next: {trackNext.title}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smooth reentry recommendations */}
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-wider text-[#86a69a]">
            现在可以从这里温和接回
          </div>

          <div className="space-y-2">
            {recommendations.slice(0, 3).map(candidate => (
              <div
                key={candidate.action.id}
                className="p-3 rounded-lg bg-[#151c19]/40 border border-[rgba(107,135,124,0.25)] flex items-center justify-between gap-2 hover:border-[rgba(107,135,124,0.45)] transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-[var(--text-primary)]">
                    [{candidate.track.name}] {candidate.action.title}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {candidate.action.effort === 'deep' ? '深入' : candidate.action.effort === 'normal' ? '正常' : '轻量'}
                    {candidate.action.note ? ` · ${candidate.action.note}` : ''}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onStartSession(
                      candidate.track.id,
                      candidate.action.id,
                      `${candidate.track.name} · ${candidate.action.title}`
                    );
                    onClose();
                  }}
                  className="px-3 py-1 rounded text-xs text-[var(--text-hero)] bg-[rgba(107,135,124,0.22)] hover:bg-[rgba(107,135,124,0.36)] border border-[rgba(107,135,124,0.45)] flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Play className="w-3 h-3 text-[#86a69a]" />
                  <span>以此开局</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Optional quick note */}
        <div className="space-y-1.5 text-xs">
          <label className="text-[var(--text-muted)]">这几天想留下一句话吗？(可选)</label>
          <input
            type="text"
            placeholder="如: 出去玩了两天放空，今天精力充沛。"
            value={reentryNote}
            onChange={e => setReentryNote(e.target.value)}
            className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="brass-button px-5 py-2 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5"
          >
            <span>接回现实 · 开始今天</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#dfbf85]" />
          </button>
        </div>
      </div>
    </div>
  );
};
