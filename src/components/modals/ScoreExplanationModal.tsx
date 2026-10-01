import React from 'react';
import { X, HelpCircle, ShieldCheck } from 'lucide-react';
import { ScoredCandidate } from '../../types';

interface ScoreExplanationModalProps {
  candidate: ScoredCandidate;
  onClose: () => void;
}

export const ScoreExplanationModal: React.FC<ScoreExplanationModalProps> = ({
  candidate,
  onClose,
}) => {
  const { action, track, score, explanation } = candidate;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="brass-panel-elevated p-6 rounded-lg max-w-md w-full space-y-5 border border-[#c69956]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 type-l6 font-mono font-medium text-[#b8894f]">
            <ShieldCheck className="w-4 h-4 text-[#b8894f]" />
            <span>DETERMINISTIC RECOMMENDATION</span>
          </div>
          <h3 className="type-l3 font-semibold text-[var(--text-hero)]">
            为什么系统推荐这个动作？
          </h3>
          <p className="type-l5 text-[var(--text-secondary)] font-sans">
            {track.name} · {action.title}
          </p>
        </div>

        {/* Breakdown Table */}
        <div className="brass-panel p-4 rounded-lg space-y-2.5 type-l5 text-[var(--text-primary)] font-medium font-sans">
          <div className="flex items-center justify-between">
            <span>主线权重 ({track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'})</span>
            <span className="text-[#b8894f] font-mono">+{explanation.trackWeight}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>停顿补偿 (Staleness Bonus)</span>
            <span className="text-[#b8894f] font-mono">+{explanation.stalenessBonus}</span>
          </div>

          {explanation.continuityBonus > 0 && (
            <div className="flex items-center justify-between">
              <span>连续推进势头 (Continuity Bonus)</span>
              <span className="text-[#b8894f] font-mono">+{explanation.continuityBonus}</span>
            </div>
          )}

          {explanation.clarityBonus !== 0 && (
            <div className="flex items-center justify-between">
              <span>目标清晰度 (Clarity Bonus)</span>
              <span className={explanation.clarityBonus > 0 ? 'text-[#b8894f] font-mono' : 'text-[#e06c75] font-mono'}>
                {explanation.clarityBonus > 0 ? `+${explanation.clarityBonus}` : explanation.clarityBonus}
              </span>
            </div>
          )}

          {explanation.effortMatchBonus !== 0 && (
            <div className="flex items-center justify-between">
              <span>当下意愿负荷匹配 (Effort Match)</span>
              <span className={explanation.effortMatchBonus > 0 ? 'text-[#b8894f] font-mono' : 'text-[#e06c75] font-mono'}>
                {explanation.effortMatchBonus > 0 ? `+${explanation.effortMatchBonus}` : explanation.effortMatchBonus}
              </span>
            </div>
          )}

          {explanation.recentOverinvestmentPenalty > 0 && (
            <div className="flex items-center justify-between">
              <span>近期过度集中冷却 (Cool-down)</span>
              <span className="text-[#e06c75] font-mono">-{explanation.recentOverinvestmentPenalty}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#b8894f]/20 flex items-center justify-between font-bold type-l4">
            <span className="text-[var(--text-hero)]">综合推荐得分 (Total Score)</span>
            <span className="text-[#b8894f] font-mono type-l3 font-bold">{score}</span>
          </div>
        </div>

        {/* Explain in human words */}
        <div className="p-3 bg-[#181512] rounded border border-[#b8894f]/15 space-y-1.5 type-l5 text-[var(--text-secondary)] leading-relaxed font-sans">
          <div className="font-semibold text-[#b8894f]">系统决策依据：</div>
          <ul className="list-disc list-inside space-y-0.5">
            {explanation.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="brass-button px-4 py-1.5 type-l5 font-semibold text-[var(--text-hero)] rounded cursor-pointer"
          >
            明白，继续
          </button>
        </div>
      </div>
    </div>
  );
};
