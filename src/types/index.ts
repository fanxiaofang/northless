export type TrackRole = 'main' | 'maintenance' | 'paused';
export type ActionEffort = 'light' | 'normal' | 'deep';
export type ActionStatus = 'active' | 'done' | 'later';
export type EntryType = 'session' | 'note';
export type InboxStatus = 'inbox' | 'promoted' | 'archived';

export interface Track {
  id: string;
  name: string;
  description: string;
  role: TrackRole;
  roadmap: string[];
  current_stage_index: number;
  status: 'active' | 'archived';
  created_at: string;
  last_touched_at?: string; // YYYY-MM-DD
}

export interface NextAction {
  id: string;
  track_id: string;
  stage_index?: number;
  title: string;
  note?: string;
  effort: ActionEffort;
  status: ActionStatus;
  position: number;
  created_at: string;
  completed_at?: string;
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  track_id?: string;
  stage_index?: number;
  type: EntryType;
  content: string;
  started_at?: string; // e.g. "14:10"
  ended_at?: string;   // e.g. "15:05"
  duration_minutes?: number;
  created_at: string;
}

export interface InboxItem {
  id: string;
  content: string;
  track_id?: string;
  status: InboxStatus;
  created_at: string;
}

export interface DayClose {
  date: string; // YYYY-MM-DD
  note?: string;
  carry_forward?: string;
  closed_at: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  url: string;
  type: 'link' | 'embed';
  icon?: string;
  track_id?: string;
  pinned: boolean;
  position: number;
}

export interface ScoreExplanation {
  trackWeight: number;
  stalenessBonus: number;
  continuityBonus: number;
  clarityBonus: number;
  effortMatchBonus: number;
  recentOverinvestmentPenalty: number;
  totalScore: number;
  reasons: string[];
}

export interface ScoredCandidate {
  action: NextAction;
  track: Track;
  score: number;
  explanation: ScoreExplanation;
}

export interface ActiveSession {
  track_id: string;
  action_id?: string;
  task_title: string;
  started_at: number; // timestamp
  elapsed_seconds: number;
  is_running: boolean;
}
