import { LogEntry, NextAction, Track } from '../types';

export interface StageTrajectoryData {
  stageIndex: number;
  stageName: string;
  state: 'completed' | 'current' | 'future';
  dateRange?: string;
  totalMinutes: number;
  touchCount: number;
  completedActions: NextAction[];
  keyMilestones: string[];
  logs: LogEntry[];
}

export interface TrackTrajectoryOverview {
  createdDateStr: string;
  daysSinceCreation: number;
  totalMinutes: number;
  totalTouches: number;
  completedStageCount: number;
  totalStageCount: number;
  currentStageName: string;
  remainingStageCount: number;
  stages: StageTrajectoryData[];
}

export function formatCompactDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
  }
  return dateStr;
}

export function formatDurationHoursMins(minutes: number): string {
  if (minutes <= 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function calculateTrackTrajectory(
  track: Track,
  allLogs: LogEntry[],
  allActions: NextAction[],
  currentDateStr: string
): TrackTrajectoryOverview {
  const trackLogs = allLogs
    .filter(l => l.track_id === track.id)
    .sort((a, b) => a.date.localeCompare(b.date) || a.created_at.localeCompare(b.created_at));

  const trackActions = allActions.filter(a => a.track_id === track.id);
  const completedActions = trackActions.filter(a => a.status === 'done');

  // Days since creation (距今持续了多久)
  const createdDate = new Date(track.created_at || currentDateStr);
  const curDate = new Date(currentDateStr);
  const diffTime = Math.max(0, curDate.getTime() - createdDate.getTime());
  const daysSinceCreation = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const totalMinutes = trackLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  const totalTouches = trackLogs.length;

  const totalStageCount = track.roadmap.length;
  const currentStageIndex = Math.min(Math.max(0, track.current_stage_index), Math.max(0, totalStageCount - 1));
  const completedStageCount = currentStageIndex;
  const remainingStageCount = Math.max(0, totalStageCount - currentStageIndex - 1);
  const currentStageName = track.roadmap[currentStageIndex] || '未定义';

  // Group logs and actions into stages
  const stageLogsMap: Map<number, LogEntry[]> = new Map();
  const stageActionsMap: Map<number, NextAction[]> = new Map();

  for (let i = 0; i < totalStageCount; i++) {
    stageLogsMap.set(i, []);
    stageActionsMap.set(i, []);
  }

  // Assign completed actions
  completedActions.forEach(act => {
    if (act.stage_index !== undefined && act.stage_index < totalStageCount) {
      stageActionsMap.get(act.stage_index)?.push(act);
    } else {
      const targetStage = Math.max(0, Math.min(currentStageIndex - 1, totalStageCount - 1));
      stageActionsMap.get(targetStage)?.push(act);
    }
  });

  // Assign logs
  const unassignedLogs: LogEntry[] = [];
  trackLogs.forEach(log => {
    if (log.stage_index !== undefined && log.stage_index < totalStageCount) {
      stageLogsMap.get(log.stage_index)?.push(log);
    } else {
      unassignedLogs.push(log);
    }
  });

  // Distribute unassigned logs chronologically
  if (unassignedLogs.length > 0) {
    if (currentStageIndex === 0) {
      stageLogsMap.get(0)?.push(...unassignedLogs);
    } else {
      const activeStageCount = currentStageIndex + 1;
      const bucketSize = Math.max(1, Math.ceil(unassignedLogs.length / activeStageCount));
      unassignedLogs.forEach((log, idx) => {
        const stageIdx = Math.min(currentStageIndex, Math.floor(idx / bucketSize));
        stageLogsMap.get(stageIdx)?.push(log);
      });
    }
  }

  // Construct StageTrajectoryData
  const stages: StageTrajectoryData[] = track.roadmap.map((stageName, idx) => {
    const isCompleted = idx < currentStageIndex;
    const isCurrent = idx === currentStageIndex;
    const state: 'completed' | 'current' | 'future' = isCompleted
      ? 'completed'
      : isCurrent
      ? 'current'
      : 'future';

    if (state === 'future') {
      return {
        stageIndex: idx,
        stageName,
        state,
        totalMinutes: 0,
        touchCount: 0,
        completedActions: [],
        keyMilestones: [],
        logs: [],
      };
    }

    const sLogs = stageLogsMap.get(idx) || [];
    const sActions = stageActionsMap.get(idx) || [];
    const stageMins = sLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

    // Calculate dates
    let dateRange: string | undefined = undefined;
    if (sLogs.length > 0) {
      const dates = sLogs.map(l => l.date).sort();
      const firstDate = formatCompactDate(dates[0]);
      const lastDate = formatCompactDate(dates[dates.length - 1]);
      dateRange = firstDate === lastDate ? firstDate : `${firstDate} - ${lastDate}`;
    } else if (isCurrent) {
      dateRange = `${formatCompactDate(currentDateStr)} · 攻坚中`;
    }

    // Determine key milestones
    const milestones: string[] = [];
    sActions.forEach(a => milestones.push(a.title));

    // Also pick top session highlights from logs
    sLogs
      .filter(l => l.type === 'session' && l.duration_minutes && l.duration_minutes >= 30)
      .slice(0, 3)
      .forEach(l => {
        if (!milestones.some(m => m.includes(l.content.slice(0, 8)))) {
          milestones.push(l.content);
        }
      });

    if (milestones.length === 0 && isCurrent) {
      const activeFirst = trackActions.find(a => a.status === 'active');
      if (activeFirst) {
        milestones.push(`当前推进: ${activeFirst.title}`);
      }
    }

    return {
      stageIndex: idx,
      stageName,
      state,
      dateRange,
      totalMinutes: stageMins,
      touchCount: sLogs.length,
      completedActions: sActions,
      keyMilestones: milestones,
      logs: sLogs,
    };
  });

  return {
    createdDateStr: track.created_at || currentDateStr,
    daysSinceCreation,
    totalMinutes,
    totalTouches,
    completedStageCount,
    totalStageCount,
    currentStageName,
    remainingStageCount,
    stages,
  };
}
