import { ActionEffort, LogEntry, NextAction, ScoredCandidate, Track } from '../types';

export type EffortFilter = 'all' | 'light' | 'normal' | 'deep';

export function calculateStalenessDays(lastTouchedAt?: string, todayStr: string = getTodayDateStr()): number {
  if (!lastTouchedAt) return 999;
  const today = new Date(todayStr);
  const last = new Date(lastTouchedAt);
  const diffTime = today.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function scoreNextAction(
  action: NextAction,
  track: Track,
  logs: LogEntry[],
  todayStr: string,
  effortFilter: EffortFilter
): ScoredCandidate {
  const reasons: string[] = [];

  // 1. Track Weight
  let trackWeight = 1;
  if (track.role === 'main') {
    trackWeight = 5;
    reasons.push('当前主线 (+5)');
  } else if (track.role === 'maintenance') {
    trackWeight = 3;
    reasons.push('保温主线 (+3)');
  } else {
    trackWeight = 1;
    reasons.push('暂缓主线 (+1)');
  }

  // 2. Staleness Bonus
  const stalenessDays = calculateStalenessDays(track.last_touched_at, todayStr);
  let stalenessBonus = 0;
  if (stalenessDays === 0) {
    stalenessBonus = 0;
    reasons.push('今天已推进过 (+0)');
  } else if (stalenessDays >= 1 && stalenessDays <= 2) {
    stalenessBonus = 1;
    reasons.push('1~2 天未触达 (+1)');
  } else if (stalenessDays >= 3 && stalenessDays <= 5) {
    stalenessBonus = 2;
    reasons.push(`${stalenessDays} 天未触达 (+2)`);
  } else if (stalenessDays >= 6 && stalenessDays <= 10) {
    stalenessBonus = 3;
    reasons.push(`${stalenessDays} 天未触达 (+3)`);
  } else {
    stalenessBonus = 4;
    reasons.push('10 天以上未触达 (+4)');
  }

  // 3. Continuity Bonus
  let continuityBonus = 0;
  const yesterday = new Date(todayStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const hadYesterdayTouch = logs.some(l => l.track_id === track.id && l.date === yesterdayStr);
  if (hadYesterdayTouch && action.title.length > 4) {
    continuityBonus += 2;
    reasons.push('昨天刚推进且有明确下一步 (+2)');
  }

  // Check 3 days continuous
  const twoDaysAgo = new Date(todayStr);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
  const hadTwoDaysAgo = logs.some(l => l.track_id === track.id && l.date === twoDaysAgoStr);
  if (hadYesterdayTouch && hadTwoDaysAgo) {
    continuityBonus += 1;
    reasons.push('最近连续推进保持势头 (+1)');
  }

  // 4. Clarity Bonus
  let clarityBonus = 0;
  if (action.title.trim().length >= 6 && (action.note?.trim().length || 0) > 4) {
    clarityBonus = 2;
    reasons.push('目标上下文明确清晰 (+2)');
  } else if (action.title.trim().length < 4) {
    clarityBonus = -2;
    reasons.push('动作描述较为简略 (-2)');
  }

  // 5. Effort Match Bonus
  let effortMatchBonus = 0;
  if (effortFilter === 'light') {
    if (action.effort === 'light') {
      effortMatchBonus = 4;
      reasons.push('只想做点轻的 · 轻量优先 (+4)');
    } else if (action.effort === 'normal') {
      effortMatchBonus = 1;
      reasons.push('只想做点轻的 · 正常难度 (+1)');
    } else {
      effortMatchBonus = -3;
      reasons.push('只想做点轻的 · 深入任务降权 (-3)');
    }
  } else if (effortFilter === 'normal') {
    if (action.effort === 'normal') {
      effortMatchBonus = 3;
      reasons.push('适中节奏 · 正常难度优先 (+3)');
    } else if (action.effort === 'light') {
      effortMatchBonus = 1;
    } else {
      effortMatchBonus = -1;
    }
  } else if (effortFilter === 'deep') {
    if (action.effort === 'deep') {
      effortMatchBonus = 5;
      reasons.push('想沉进去 · 深度突破优先 (+5)');
    } else if (action.effort === 'normal') {
      effortMatchBonus = 1;
    } else {
      effortMatchBonus = -3;
    }
  }

  // 6. Recent Overinvestment Penalty
  let recentOverinvestmentPenalty = 0;
  const recentTrackSessions = logs.filter(
    l => l.track_id === track.id && (l.date === todayStr || l.date === yesterdayStr) && l.type === 'session'
  );
  if (recentTrackSessions.length >= 3) {
    recentOverinvestmentPenalty = 2;
    reasons.push('近期连续多轮高频投入 (-2)');
  } else if (recentTrackSessions.length === 2) {
    recentOverinvestmentPenalty = 1;
    reasons.push('近期投入较充足 (-1)');
  }

  const totalScore =
    trackWeight +
    stalenessBonus +
    continuityBonus +
    clarityBonus +
    effortMatchBonus -
    recentOverinvestmentPenalty;

  return {
    action,
    track,
    score: totalScore,
    explanation: {
      trackWeight,
      stalenessBonus,
      continuityBonus,
      clarityBonus,
      effortMatchBonus,
      recentOverinvestmentPenalty,
      totalScore,
      reasons,
    },
  };
}

export function getRecommendations(
  actions: NextAction[],
  tracks: Track[],
  logs: LogEntry[],
  effortFilter: EffortFilter = 'all',
  rotationOffset: number = 0,
  todayStr: string = getTodayDateStr()
): ScoredCandidate[] {
  const activeTracksMap = new Map<string, Track>();
  tracks.filter(t => t.status === 'active').forEach(t => activeTracksMap.set(t.id, t));

  // Only consider active actions belonging to active tracks
  const candidateActions = actions.filter(a => a.status === 'active' && activeTracksMap.has(a.track_id));

  const scored: ScoredCandidate[] = candidateActions.map(action => {
    const track = activeTracksMap.get(action.track_id)!;
    return scoreNextAction(action, track, logs, todayStr, effortFilter);
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  if (scored.length <= 3) return scored;

  // Apply constraint: Top 3 candidates must not be all from the same track (max 2 per track)
  const result: ScoredCandidate[] = [];
  const trackCount: Record<string, number> = {};

  // Rotate list if user requested "换一批"
  const pool = [...scored];
  if (rotationOffset > 0 && pool.length > 3) {
    const shift = rotationOffset % pool.length;
    const rotated = [...pool.slice(shift), ...pool.slice(0, shift)];
    pool.splice(0, pool.length, ...rotated);
  }

  for (const candidate of pool) {
    const trackId = candidate.track.id;
    const currentCount = trackCount[trackId] || 0;

    if (currentCount < 2) {
      result.push(candidate);
      trackCount[trackId] = currentCount + 1;
    }

    if (result.length >= 3) break;
  }

  // If still fewer than 3, fill from remaining
  if (result.length < 3) {
    for (const candidate of pool) {
      if (!result.includes(candidate)) {
        result.push(candidate);
      }
      if (result.length >= 3) break;
    }
  }

  return result;
}
