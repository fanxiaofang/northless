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
          className="absolute top-4 right-4 text-[#8a7f72] hover:text-[#f4efe8]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 type-l6 text-[#c69956]">
            <ShieldCheck className="w-4 h-4 text-[#dfbf85]" />
            <span>DETERMINISTIC RECOMMENDATION</span>
          </div>
          <h3 className="type-l3 font-bold text-[#f7f2ea]">
            为什么系统推荐这个动作？
          </h3>
          <p className="type-l6 text-[#9c9183]">
            {track.name} · {action.title}
          </p>
        </div>

        {/* Breakdown Table */}
        <div className="brass-panel p-4 rounded-lg space-y-2.5 type-l6 text-[#ded7cd]">
          <div className="flex items-center justify-between">
            <span>主线权重 ({track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'})</span>
            <span className="text-[#dfbf85]">+{explanation.trackWeight}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>停顿补偿 (Staleness Bonus)</span>
            <span className="text-[#dfbf85]">+{explanation.stalenessBonus}</span>
          </div>

          {explanation.continuityBonus > 0 && (
            <div className="flex items-center justify-between">
              <span>连续推进势头 (Continuity Bonus)</span>
              <span className="text-[#dfbf85]">+{explanation.continuityBonus}</span>
            </div>
          )}

          {explanation.clarityBonus !== 0 && (
            <div className="flex items-center justify-between">
              <span>目标清晰度 (Clarity Bonus)</span>
              <span className={explanation.clarityBonus > 0 ? 'text-[#dfbf85]' : 'text-[#e06c75]'}>
                {explanation.clarityBonus > 0 ? `+${explanation.clarityBonus}` : explanation.clarityBonus}
              </span>
            </div>
          )}

          {explanation.effortMatchBonus !== 0 && (
            <div className="flex items-center justify-between">
              <span>当下意愿负荷匹配 (Effort Match)</span>
              <span className={explanation.effortMatchBonus > 0 ? 'text-[#dfbf85]' : 'text-[#e06c75]'}>
                {explanation.effortMatchBonus > 0 ? `+${explanation.effortMatchBonus}` : explanation.effortMatchBonus}
              </span>
            </div>
          )}

          {explanation.recentOverinvestmentPenalty > 0 && (
            <div className="flex items-center justify-between">
              <span>近期过度集中冷却 (Cool-down)</span>
              <span className="text-[#e06c75]">-{explanation.recentOverinvestmentPenalty}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#c69956]/20 flex items-center justify-between font-bold type-l5">
            <span className="text-[#f7f2ea]">综合推荐得分 (Total Score)</span>
            <span className="text-[#e6c17d] font-mono type-l3 font-bold">{score}</span>
          </div>
        </div>

        {/* Explain in human words */}
        <div className="p-3 bg-[#181512] rounded border border-[#c69956]/15 space-y-1.5 type-l5 text-[#a89b8a] leading-relaxed">
          <div className="font-semibold text-[#c69956]">系统决策依据：</div>
          <ul className="list-disc list-inside space-y-0.5">
            {explanation.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="brass-button px-4 py-1.5 type-l5 font-semibold text-[#fcf9f2] rounded"
          >
            明白，继续
          </button>
        </div>
      </div>
    </div>
  );
};
