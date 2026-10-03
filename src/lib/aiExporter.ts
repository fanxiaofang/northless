import { LogEntry, NextAction, Track } from '../types';

export interface AIProvider {
  analyzeLog?(logs: LogEntry[]): Promise<string>;
  summarizeDay?(todayLogs: LogEntry[]): Promise<string>;
  suggestNext?(tracks: Track[], logs: LogEntry[]): Promise<string[]>;
}

export function generateAiPromptContext(
  tracks: Track[],
  actions: NextAction[],
  logs: LogEntry[],
  todayStr: string = new Date().toISOString().split('T')[0]
): string {
  const activeTracks = tracks.filter(t => t.status === 'active');
  const activeActions = actions.filter(a => a.status === 'active');

  const todayLogs = logs.filter(l => l.date === todayStr);

  // Past 7 days logs
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const recentLogs = logs.filter(l => l.date >= sevenDaysAgoStr && l.date <= todayStr);

  const trackLines = activeTracks
    .map(t => {
      const roleStr = t.role === 'main' ? '主线 (Main)' : t.role === 'maintenance' ? '保温 (Maintenance)' : '暂缓 (Paused)';
      const lastTouch = t.last_touched_at ? `上次推进: ${t.last_touched_at}` : '尚未触达';
      const currentNode = t.roadmap[t.current_stage_index] || '未设置';
      return `- **${t.name}** [${roleStr}] · ${lastTouch}\n  目标: ${t.description}\n  路线: ${t.roadmap.join(' → ')}\n  当前节点: ${currentNode}`;
    })
    .join('\n');

  const nextActionLines = activeActions
    .map(a => {
      const track = tracks.find(t => t.id === a.track_id);
      const trackName = track ? track.name : 'Unassigned';
      return `- [${trackName}] ${a.title} (${a.effort})${a.note ? ` - 备注: ${a.note}` : ''}`;
    })
    .join('\n');

  const todayLines = todayLogs.length > 0
    ? todayLogs
        .map(l => {
          const track = tracks.find(t => t.id === l.track_id);
          const prefix = track ? `[${track.name}] ` : '';
          const time = l.started_at ? `${l.started_at}${l.ended_at ? ` - ${l.ended_at}` : ''}` : '';
          const dur = l.duration_minutes ? ` (${l.duration_minutes}m)` : '';
          return `- ${time ? `${time} ` : ''}${prefix}${l.content}${dur}`;
        })
        .join('\n')
    : '(今天尚未留下记录)';

  const recentLines = recentLogs
    .slice(0, 15)
    .map(l => {
      const track = tracks.find(t => t.id === l.track_id);
      const prefix = track ? `[${track.name}] ` : '';
      return `- ${l.date} ${prefix}${l.content}${l.duration_minutes ? ` (${l.duration_minutes}m)` : ''}`;
    })
    .join('\n');

  return `# 当前上下文

## Tracks
${trackLines}

## Current Next
${nextActionLines}

## Recent 7 days
${recentLines}

## Today (${todayStr})
${todayLines}

---
Please:
1. summarize what actually moved forward
2. identify useful discoveries
3. suggest changes to Next
4. suggest at most 3 next actions
5. do not assume changes are accepted
`;
}
