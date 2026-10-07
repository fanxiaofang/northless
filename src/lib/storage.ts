import {
  ActiveSession,
  Card,
  DayClose,
  InboxItem,
  LogEntry,
  NextAction,
  Track
} from '../types';
import { getTodayDateStr } from './recommendation';
import { loadThemePreference, THEME_STORAGE_KEY, type ThemeMode } from './themePreference';

const STORAGE_KEYS = {
  TRACKS: 'gap_cockpit_tracks_v0',
  ACTIONS: 'gap_cockpit_actions_v0',
  LOGS: 'gap_cockpit_logs_v0',
  INBOX: 'gap_cockpit_inbox_v0',
  DAY_CLOSES: 'gap_cockpit_day_closes_v0',
  CARDS: 'gap_cockpit_cards_v0',
  ACTIVE_SESSION: 'gap_cockpit_active_session_v0',
  LAST_VISIT: 'gap_cockpit_last_visit_v0',
  REENTRY_DISMISSED_DATE: 'gap_cockpit_reentry_dismissed_v0',
  SEED_SCHEMA_VERSION: 'gap_cockpit_seed_schema_version',
};

const CURRENT_SEED_SCHEMA_VERSION = 5;

const LEGACY_TRACK_DESCRIPTIONS: Record<string, { legacy: string; replacement: string }> = {
  track_agent: {
    legacy: '掌握现代 Agent 开发，并形成一个可以用于求职展示的项目。',
    replacement: '掌握现代 Agent 开发，并形成一个可展示、可持续迭代的完整项目。',
  },
  track_algo: {
    legacy: '维持高频算法手感，巩固二叉树、图论与经典动态规划。',
    replacement: '保持算法题手感，持续巩固高频数据结构、经典算法与常见解题模型。',
  },
  track_linux: {
    legacy: '重温网络底层模型与高并发编程架构。',
    replacement: '持续巩固 Linux 系统编程、网络 I/O 与高并发基础能力。',
  },
  track_interview: {
    legacy: '计算机网络、操作系统、数据库系统底层核心要点速查。',
    replacement: '建立计算机网络、操作系统、数据库等核心基础知识的稳定复习体系。',
  },
  track_resume: {
    legacy: '简历叙事线重构与个人作品集网站部署。',
    replacement: '持续整理项目叙事、简历表达与作品展示，使技术能力能够被清晰呈现。',
  },
};

function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function getInitialSeedData() {
  const today = getTodayDateStr();
  const d1 = getDaysAgo(1);
  const d2 = getDaysAgo(2);
  const d3 = getDaysAgo(3);
  const d5 = getDaysAgo(5);
  const d8 = getDaysAgo(8);
  const d18 = getDaysAgo(18);

  const initialTracks: Track[] = [
    {
      id: 'track_agent',
      name: 'Agent / AI',
      description: '掌握现代 Agent 开发，并形成一个可展示、可持续迭代的完整项目。',
      role: 'main',
      roadmap: ['基础理解', '小 Demo', '完整项目', '求职包装'],
      current_stage_index: 2,
      status: 'active',
      created_at: '2026-09-01',
      last_touched_at: today,
    },
    {
      id: 'track_snake_demo',
      name: '蛇形路线演示',
      description: '用于观察较长路线如何连续折返，并同时呈现已完成、当前与未来节点。',
      role: 'main',
      roadmap: [
        '方向确认',
        '资料盘点',
        '最小原型',
        '核心实现',
        '交互打磨',
        '响应式验证',
        '边缘场景',
        '性能检查',
        '反馈复盘',
        '发布准备',
        '长期维护',
      ],
      current_stage_index: 5,
      status: 'active',
      created_at: '2026-09-01',
      last_touched_at: today,
    },
    {
      id: 'track_algo',
      name: '算法',
      description: '保持算法题手感，持续巩固高频数据结构、经典算法与常见解题模型。',
      role: 'maintenance',
      roadmap: ['二叉树/图论', '动态规划专题', '高频75题速通'],
      current_stage_index: 0,
      status: 'active',
      created_at: '2026-09-01',
      last_touched_at: d5,
    },
    {
      id: 'track_linux',
      name: 'Linux / C',
      description: '持续巩固 Linux 系统编程、网络 I/O 与高并发基础能力。',
      role: 'maintenance',
      roadmap: ['epoll并发模型', '内存与系统调用', '简易网关原型'],
      current_stage_index: 0,
      status: 'active',
      created_at: '2026-09-01',
      last_touched_at: d8,
    },
    {
      id: 'track_interview',
      name: '八股体系',
      description: '建立计算机网络、操作系统、数据库等核心基础知识的稳定复习体系。',
      role: 'paused',
      roadmap: ['计算机网络', '操作系统', 'MySQL/Redis'],
      current_stage_index: 0,
      status: 'active',
      created_at: '2026-09-01',
      last_touched_at: d18,
    },
    {
      id: 'track_resume',
      name: '求职包装',
      description: '持续整理项目叙事、简历表达与作品展示，使技术能力能够被清晰呈现。',
      role: 'paused',
      roadmap: ['简历骨架梳理', '作品集打磨', '模拟技术沟通'],
      current_stage_index: 0,
      status: 'active',
      created_at: '2026-09-01',
      last_touched_at: undefined,
    },
  ];

  const initialActions: NextAction[] = [
    {
      id: 'act_1',
      track_id: 'track_agent',
      title: '跑一个最小 MCP Server',
      note: '昨天刚完成 tool calling，继续这里上下文最完整',
      effort: 'deep',
      status: 'active',
      position: 0,
      created_at: d1,
    },
    {
      id: 'act_2',
      track_id: 'track_agent',
      title: '整理当前 Agent Demo README',
      note: '理清 tools 和 prompt 架构说明',
      effort: 'normal',
      status: 'active',
      position: 1,
      created_at: d2,
    },
    {
      id: 'act_3',
      track_id: 'track_agent',
      title: '试一下 MCP tool inspection',
      note: '配合本地 inspector 跑一次工具调用生命周期',
      effort: 'normal',
      status: 'later',
      position: 2,
      created_at: d3,
    },
    {
      id: 'act_4',
      track_id: 'track_algo',
      title: '一道简单二叉树 (LeetCode 104)',
      note: '5 天没碰，先做个轻的找找手感',
      effort: 'light',
      status: 'active',
      position: 0,
      created_at: d5,
    },
    {
      id: 'act_5',
      track_id: 'track_algo',
      title: '二叉树最近公共祖先 (LCA)',
      note: '温习递归树后序遍历',
      effort: 'normal',
      status: 'later',
      position: 1,
      created_at: d5,
    },
    {
      id: 'act_6',
      track_id: 'track_linux',
      title: '重看 epoll ET vs LT 触发机制',
      note: '8 天没碰，温习边缘触发与条件触发区别',
      effort: 'normal',
      status: 'active',
      position: 0,
      created_at: d8,
    },
    {
      id: 'act_7',
      track_id: 'track_linux',
      title: '写一个非阻塞 socket 事件循环 demo',
      note: '用 epoll_wait 搭建简易 echo server',
      effort: 'deep',
      status: 'later',
      position: 1,
      created_at: d8,
    },
    {
      id: 'act_done_agent_1',
      track_id: 'track_agent',
      stage_index: 0,
      title: 'ReAct 原理与基础 Prompt Loop 验证',
      note: '完成 Agent 最底层推理与执行循环实验',
      effort: 'normal',
      status: 'done',
      position: 99,
      created_at: '2026-09-02',
      completed_at: '2026-09-12',
    },
    {
      id: 'act_done_agent_2',
      track_id: 'track_agent',
      stage_index: 1,
      title: '首个 CLI Agent 原型与 Tool Calling 跑通',
      note: '封装最小工具注册表并跑通命令行交互',
      effort: 'deep',
      status: 'done',
      position: 98,
      created_at: '2026-09-18',
      completed_at: '2026-09-28',
    },
  ];

  const initialLogs: LogEntry[] = [
    // Historical milestones for Agent / AI trajectory
    {
      id: 'log_hist_1',
      date: '2026-09-03',
      track_id: 'track_agent',
      stage_index: 0,
      type: 'session',
      content: '梳理 LLM Agent 架构：Planning, Memory, Tools 与 ReAct 推理',
      started_at: '14:00',
      ended_at: '14:50',
      duration_minutes: 50,
      created_at: '2026-09-03T14:50:00Z',
    },
    {
      id: 'log_hist_2',
      date: '2026-09-10',
      track_id: 'track_agent',
      stage_index: 0,
      type: 'session',
      content: '手写最小 Prompt 循环，完成 ReAct 推理链与停止词验证',
      started_at: '15:10',
      ended_at: '16:15',
      duration_minutes: 65,
      created_at: '2026-09-10T16:15:00Z',
    },
    {
      id: 'log_hist_3',
      date: '2026-09-18',
      track_id: 'track_agent',
      stage_index: 1,
      type: 'session',
      content: '完成 Weather Tool 注册并跑通首个本地调用测试 Demo',
      started_at: '16:00',
      ended_at: '16:45',
      duration_minutes: 45,
      created_at: '2026-09-18T16:45:00Z',
    },
    {
      id: 'log_hist_4',
      date: '2026-09-26',
      track_id: 'track_agent',
      stage_index: 1,
      type: 'session',
      content: '重构 CLI 工具交互，封装基础 Agent Runner 与上下文管理',
      started_at: '20:00',
      ended_at: '21:10',
      duration_minutes: 70,
      created_at: '2026-09-26T21:10:00Z',
    },
    {
      id: 'log_today_1',
      date: today,
      track_id: 'track_agent',
      type: 'session',
      content: 'tool calling 跑通，完成首个自定义天气工具注册',
      started_at: '14:10',
      ended_at: '15:05',
      duration_minutes: 55,
      created_at: `${today}T15:05:00Z`,
    },
    {
      id: 'log_today_2',
      date: today,
      type: 'note',
      content: '下午比较散，去楼下买杯奶茶散了散步。',
      started_at: '15:40',
      created_at: `${today}T15:40:00Z`,
    },
    {
      id: 'log_today_3',
      date: today,
      track_id: 'track_agent',
      type: 'note',
      content: '梳理 MCP stdio transport 交互协议要点',
      started_at: '17:15',
      created_at: `${today}T17:15:00Z`,
    },
    {
      id: 'log_today_4',
      date: today,
      type: 'note',
      content: '玩了一会儿塞尔达，放松一下神经',
      started_at: '19:20',
      created_at: `${today}T19:20:00Z`,
    },
    {
      id: 'log_today_5',
      date: today,
      type: 'session',
      content: '继续梳理产品结构，明确 Northless 核心流与复古朋克风格',
      started_at: '21:10',
      ended_at: '22:20',
      duration_minutes: 70,
      created_at: `${today}T22:20:00Z`,
    },
    // Past days for trajectory matrix
    {
      id: 'log_d1_1',
      date: d1,
      track_id: 'track_agent',
      type: 'session',
      content: 'Agents SDK basic demo 跑通',
      started_at: '15:20',
      ended_at: '16:05',
      duration_minutes: 45,
      created_at: `${d1}T16:05:00Z`,
    },
    {
      id: 'log_d1_2',
      date: d1,
      track_id: 'track_algo',
      type: 'session',
      content: '做了一道二叉树层序遍历',
      started_at: '20:10',
      ended_at: '20:45',
      duration_minutes: 35,
      created_at: `${d1}T20:45:00Z`,
    },
    {
      id: 'log_d2_1',
      date: d2,
      track_id: 'track_agent',
      type: 'session',
      content: '研究 agent loop 与 context 注入机制',
      started_at: '10:00',
      ended_at: '11:10',
      duration_minutes: 70,
      created_at: `${d2}T11:10:00Z`,
    },
    {
      id: 'log_d3_1',
      date: d3,
      track_id: 'track_agent',
      type: 'session',
      content: '研究 handoff 与 multi-agent 通信规范',
      started_at: '16:00',
      ended_at: '17:00',
      duration_minutes: 60,
      created_at: `${d3}T17:00:00Z`,
    },
    {
      id: 'log_d5_1',
      date: d5,
      track_id: 'track_algo',
      type: 'session',
      content: '复习二叉树递归中序遍历与栈模拟',
      started_at: '14:00',
      ended_at: '14:30',
      duration_minutes: 30,
      created_at: `${d5}T14:30:00Z`,
    },
    {
      id: 'log_d8_1',
      date: d8,
      track_id: 'track_linux',
      type: 'session',
      content: '重新过了一遍 Linux I/O 多路复用五种模型',
      started_at: '15:00',
      ended_at: '15:50',
      duration_minutes: 50,
      created_at: `${d8}T15:50:00Z`,
    },
  ];

  const initialInbox: InboxItem[] = [
    {
      id: 'inbox_1',
      content: '看看 MCP transport 实现细节（stdio vs SSE）',
      track_id: 'track_agent',
      status: 'inbox',
      created_at: d1,
    },
    {
      id: 'inbox_2',
      content: '以后把以前写的 API gateway 项目经验梳理成文',
      track_id: 'track_linux',
      status: 'inbox',
      created_at: d2,
    },
    {
      id: 'inbox_3',
      content: 'interval DP（区间动态规划）找个周末集中复习',
      track_id: 'track_algo',
      status: 'inbox',
      created_at: d3,
    },
    {
      id: 'inbox_4',
      content: '突然觉得 Agent 项目可以考虑做成一个自己每天真正使用的工具',
      track_id: 'track_agent',
      status: 'inbox',
      created_at: today,
    },
    {
      id: 'inbox_5',
      content: '整理一下常用开源库的 GitHub Star 脉络',
      status: 'inbox',
      created_at: d5,
    },
  ];

  const initialCards: Card[] = [
    {
      id: 'card_english',
      title: 'Technical English',
      description: '技术英文文档速读与日常语料沉浸',
      url: 'https://en.wikipedia.org/wiki/Computer_science',
      type: 'link',
      pinned: true,
      position: 0,
    },
    {
      id: 'card_reading',
      title: 'Reading',
      description: '高质量技术随笔与系统架构文章',
      url: 'https://news.ycombinator.com',
      type: 'link',
      pinned: true,
      position: 1,
    },
    {
      id: 'card_projects',
      title: 'Projects',
      description: '个人开源代码与本地开发仓库索引',
      url: 'https://github.com',
      type: 'link',
      pinned: true,
      position: 2,
    },
    {
      id: 'card_mcp',
      title: 'MCP Docs',
      description: 'Model Context Protocol 官方规范文档',
      url: 'https://modelcontextprotocol.io',
      type: 'link',
      track_id: 'track_agent',
      pinned: false,
      position: 3,
    },
  ];

  const initialDayCloses: DayClose[] = [
    {
      date: d1,
      note: '状态平稳，Agent 推进符合预期。',
      carry_forward: '明天把 tool calling 跑通。',
      closed_at: `${d1}T23:30:00Z`,
    },
  ];

  return {
    tracks: initialTracks,
    actions: initialActions,
    logs: initialLogs,
    inbox: initialInbox,
    cards: initialCards,
    dayCloses: initialDayCloses,
  };
}

export function loadData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function saveData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function migrateSeedDataIfNeeded(): void {
  localStorage.removeItem('gap_cockpit_phases_v0');
  localStorage.removeItem('gap_cockpit_current_phase_id_v0');

  if (localStorage.getItem(STORAGE_KEYS.SEED_SCHEMA_VERSION) === String(CURRENT_SEED_SCHEMA_VERSION)) {
    return;
  }

  const tracks = loadData<Track[]>(STORAGE_KEYS.TRACKS, []);
  let tracksChanged = false;

  const migratedTracks = tracks.map(track => {
    const migration = LEGACY_TRACK_DESCRIPTIONS[track.id];
    if (!migration || track.description !== migration.legacy) return track;

    tracksChanged = true;
    return { ...track, description: migration.replacement };
  });

  if (tracksChanged) saveData(STORAGE_KEYS.TRACKS, migratedTracks);

  const currentLogs = loadData<LogEntry[]>(STORAGE_KEYS.LOGS, []);
  if (currentLogs.some(l => l.id === 'log_today_1') && !currentLogs.some(l => l.id === 'log_hist_1')) {
    const seed = getInitialSeedData();
    const existingLogIds = new Set(currentLogs.map(l => l.id));
    const missingLogs = seed.logs.filter(l => !existingLogIds.has(l.id));
    saveData(STORAGE_KEYS.LOGS, [...currentLogs, ...missingLogs]);

    const currentActions = loadData<NextAction[]>(STORAGE_KEYS.ACTIONS, []);
    const existingActIds = new Set(currentActions.map(a => a.id));
    const missingActions = seed.actions.filter(a => !existingActIds.has(a.id));
    saveData(STORAGE_KEYS.ACTIONS, [...currentActions, ...missingActions]);
  }

  localStorage.setItem(STORAGE_KEYS.SEED_SCHEMA_VERSION, String(CURRENT_SEED_SCHEMA_VERSION));
}

const CORE_STORAGE_KEYS = [
  STORAGE_KEYS.TRACKS, STORAGE_KEYS.ACTIONS, STORAGE_KEYS.LOGS,
  STORAGE_KEYS.INBOX, STORAGE_KEYS.CARDS, STORAGE_KEYS.DAY_CLOSES,
  STORAGE_KEYS.ACTIVE_SESSION,
] as const;

function hasExistingWorkspace(): boolean {
  return CORE_STORAGE_KEYS.some(key => localStorage.getItem(key) !== null);
}

function initializeDemoData(): void {
  const seed = getInitialSeedData();
  saveData(STORAGE_KEYS.TRACKS, seed.tracks);
  saveData(STORAGE_KEYS.ACTIONS, seed.actions);
  saveData(STORAGE_KEYS.LOGS, seed.logs);
  saveData(STORAGE_KEYS.INBOX, seed.inbox);
  saveData(STORAGE_KEYS.CARDS, seed.cards);
  saveData(STORAGE_KEYS.DAY_CLOSES, seed.dayCloses);
  saveData(STORAGE_KEYS.ACTIVE_SESSION, null);
}

function initializeEmptyData(): void {
  for (const key of CORE_STORAGE_KEYS) {
    saveData(key, key === STORAGE_KEYS.ACTIVE_SESSION ? null : []);
  }
}

function ensureCoreStorageShape(): void {
  for (const key of CORE_STORAGE_KEYS) {
    if (localStorage.getItem(key) === null) {
      saveData(key, key === STORAGE_KEYS.ACTIVE_SESSION ? null : []);
    }
  }
}

export function initializeStorageIfNeeded(): void {
  if (hasExistingWorkspace()) {
    ensureCoreStorageShape();
  } else {
    if (import.meta.env.DEV) initializeDemoData();
    else initializeEmptyData();
    saveData(STORAGE_KEYS.LAST_VISIT, getTodayDateStr());
  }
  migrateSeedDataIfNeeded();
}

export const RECOVERY_SNAPSHOT_KEY = 'northless_recovery_snapshot_v1';
export const LAST_BACKUP_EXPORT_KEY = 'northless_last_backup_export_at_v1';

export interface BackupData {
  tracks: Track[];
  actions: NextAction[];
  logs: LogEntry[];
  inbox: InboxItem[];
  cards: Card[];
  day_closes: DayClose[];
}

export interface NorthlessBackupV1 {
  kind: 'northless-backup';
  format_version: 1;
  exported_at: string;
  data: BackupData;
  preferences?: { theme?: ThemeMode };
}

export type BackupParseResult =
  | { ok: true; backup: NorthlessBackupV1 }
  | { ok: false; code: 'INVALID_JSON' | 'INVALID_FORMAT' | 'UNSUPPORTED_VERSION' | 'INVALID_DATA'; message: string };

export type RestoreResult =
  | { ok: true; backup: NorthlessBackupV1 }
  | { ok: false; code: 'INVALID_DATA' | 'STORAGE_ERROR' | 'ROLLBACK_FAILED'; message: string };

export interface RecoverySnapshot {
  created_at: string;
  reason: 'before-import' | 'before-reset';
  backup: NorthlessBackupV1;
}

const DATA_KEYS = {
  tracks: STORAGE_KEYS.TRACKS,
  actions: STORAGE_KEYS.ACTIONS,
  logs: STORAGE_KEYS.LOGS,
  inbox: STORAGE_KEYS.INBOX,
  cards: STORAGE_KEYS.CARDS,
  day_closes: STORAGE_KEYS.DAY_CLOSES,
} as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isDate = (value: unknown): value is string => isString(value)
  && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  && !Number.isNaN(Date.parse(value));
const optional = (value: unknown, check: (value: unknown) => boolean) => value === undefined || check(value);
const oneOf = (value: unknown, options: readonly string[]) => isString(value) && options.includes(value);

const validators: { [K in keyof BackupData]: (value: unknown) => boolean } = {
  tracks: value => isRecord(value) && isString(value.id) && isString(value.name) && isString(value.description)
    && oneOf(value.role, ['main', 'maintenance', 'paused']) && Array.isArray(value.roadmap)
    && value.roadmap.every(isString) && isNumber(value.current_stage_index)
    && oneOf(value.status, ['active', 'archived']) && isString(value.created_at)
    && optional(value.last_touched_at, isString),
  actions: value => isRecord(value) && isString(value.id) && isString(value.track_id)
    && isString(value.title) && optional(value.note, isString)
    && oneOf(value.effort, ['light', 'normal', 'deep']) && oneOf(value.status, ['active', 'done', 'later'])
    && isNumber(value.position) && isString(value.created_at) && optional(value.completed_at, isString),
  logs: value => isRecord(value) && isString(value.id) && isString(value.date)
    && optional(value.track_id, isString) && oneOf(value.type, ['session', 'note'])
    && isString(value.content) && optional(value.started_at, isString)
    && optional(value.ended_at, isString) && optional(value.duration_minutes, isNumber)
    && isString(value.created_at),
  inbox: value => isRecord(value) && isString(value.id) && isString(value.content)
    && optional(value.track_id, isString) && oneOf(value.status, ['inbox', 'promoted', 'archived'])
    && isString(value.created_at),
  cards: value => isRecord(value) && isString(value.id) && isString(value.title)
    && optional(value.description, isString) && isString(value.url)
    && oneOf(value.type, ['link', 'embed']) && optional(value.icon, isString)
    && optional(value.track_id, isString) && typeof value.pinned === 'boolean' && isNumber(value.position),
  day_closes: value => isRecord(value) && isString(value.date)
    && optional(value.note, isString) && optional(value.carry_forward, isString)
    && isString(value.closed_at),
};

export function validateBackup(value: unknown): BackupParseResult {
  if (!isRecord(value)) return { ok: false, code: 'INVALID_FORMAT', message: '无法识别为 Northless 备份' };
  if (value.kind !== 'northless-backup') return { ok: false, code: 'INVALID_FORMAT', message: '无法识别为 Northless 备份' };
  if (typeof value.format_version === 'number' && value.format_version > 1) {
    return { ok: false, code: 'UNSUPPORTED_VERSION', message: '此备份版本高于当前 Northless 支持的版本' };
  }
  if (value.format_version !== 1) return { ok: false, code: 'UNSUPPORTED_VERSION', message: '不支持此备份版本' };
  if (!isDate(value.exported_at) || !isRecord(value.data)) {
    return { ok: false, code: 'INVALID_DATA', message: '备份缺少有效的导出时间或数据' };
  }
  for (const key of Object.keys(DATA_KEYS) as (keyof BackupData)[]) {
    const entries = value.data[key];
    if (!Array.isArray(entries) || !entries.every(validators[key])) {
      return { ok: false, code: 'INVALID_DATA', message: `备份中的 ${key} 数据缺失或格式无效` };
    }
  }
  if (value.preferences !== undefined && (!isRecord(value.preferences)
    || !optional(value.preferences.theme, theme => oneOf(theme, ['dark', 'light'])))) {
    return { ok: false, code: 'INVALID_DATA', message: '备份中的主题设置无效' };
  }
  return { ok: true, backup: value as unknown as NorthlessBackupV1 };
}

export function parseBackup(jsonString: string): BackupParseResult {
  let value: unknown;
  try { value = JSON.parse(jsonString); }
  catch { return { ok: false, code: 'INVALID_JSON', message: '备份文件不是有效的 JSON' }; }
  if (isRecord(value) && value.version === '1.0.0' && value.kind === undefined) {
    const legacy = value;
    value = {
      kind: 'northless-backup', format_version: 1, exported_at: value.exported_at,
      data: Object.fromEntries(Object.keys(DATA_KEYS).map(key => [key, legacy[key]])),
    };
  }
  return validateBackup(value);
}

function readStoredArray<K extends keyof BackupData>(key: K): BackupData[K] {
  const raw = localStorage.getItem(DATA_KEYS[key]);
  const value: unknown = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(value) || !value.every(validators[key])) throw new Error(`当前 ${key} 数据无效`);
  return value as BackupData[K];
}

export function createCurrentSnapshot(): NorthlessBackupV1 {
  return {
    kind: 'northless-backup', format_version: 1, exported_at: new Date().toISOString(),
    data: {
      tracks: readStoredArray('tracks'), actions: readStoredArray('actions'),
      logs: readStoredArray('logs'), inbox: readStoredArray('inbox'),
      cards: readStoredArray('cards'), day_closes: readStoredArray('day_closes'),
    },
    preferences: { theme: loadThemePreference() },
  };
}

export const exportAllData = createCurrentSnapshot;

type RawSnapshot = Record<string, string | null>;
const TRANSACTION_KEYS = [...Object.values(DATA_KEYS), THEME_STORAGE_KEY, STORAGE_KEYS.ACTIVE_SESSION,
  STORAGE_KEYS.LAST_VISIT, STORAGE_KEYS.SEED_SCHEMA_VERSION, RECOVERY_SNAPSHOT_KEY];

function captureRawSnapshot(): RawSnapshot {
  return Object.fromEntries(TRANSACTION_KEYS.map(key => [key, localStorage.getItem(key)]));
}

export function restoreSnapshot(snapshot: RawSnapshot): void {
  // Free the space occupied by partial writes before restoring exact old values.
  for (const [key, value] of Object.entries(snapshot)) {
    if (localStorage.getItem(key) !== value) localStorage.removeItem(key);
  }
  for (const [key, value] of Object.entries(snapshot)) {
    if (value !== null && localStorage.getItem(key) !== value) localStorage.setItem(key, value);
  }
}

function writeBackup(backup: NorthlessBackupV1): void {
  for (const key of Object.keys(DATA_KEYS) as (keyof BackupData)[]) {
    localStorage.setItem(DATA_KEYS[key], JSON.stringify(backup.data[key]));
  }
  if (backup.preferences?.theme) localStorage.setItem(THEME_STORAGE_KEY, backup.preferences.theme);
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, 'null');
}

function failure(error: unknown, rollbackError?: unknown): RestoreResult {
  const detail = error instanceof Error ? error.message : String(error);
  if (rollbackError) return { ok: false, code: 'ROLLBACK_FAILED', message: `恢复失败，自动回滚也失败：${detail}；${String(rollbackError)}` };
  return { ok: false, code: 'STORAGE_ERROR', message: `写入失败，已自动回滚：${detail}` };
}

function runTransaction(backup: NorthlessBackupV1, reason: RecoverySnapshot['reason'],
  extraWrite?: () => void): RestoreResult {
  const validated = validateBackup(backup);
  if (!validated.ok) return { ok: false, code: 'INVALID_DATA', message: validated.message };
  let before: RawSnapshot;
  let current: NorthlessBackupV1;
  try { before = captureRawSnapshot(); current = createCurrentSnapshot(); }
  catch (error) { return { ok: false, code: 'STORAGE_ERROR', message: `无法读取当前数据：${String(error)}` }; }
  try {
    localStorage.setItem(RECOVERY_SNAPSHOT_KEY, JSON.stringify({
      created_at: new Date().toISOString(), reason, backup: current,
    } satisfies RecoverySnapshot));
    writeBackup(validated.backup);
    extraWrite?.();
    return { ok: true, backup: validated.backup };
  } catch (error) {
    try { restoreSnapshot(before); return failure(error); }
    catch (rollbackError) { return failure(error, rollbackError); }
  }
}

export function applyBackupAtomically(backup: NorthlessBackupV1): RestoreResult {
  return runTransaction(backup, 'before-import');
}

export function getRecoverySnapshot(): RecoverySnapshot | null {
  try {
    const raw = localStorage.getItem(RECOVERY_SNAPSHOT_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !isDate(value.created_at)
      || !oneOf(value.reason, ['before-import', 'before-reset'])) return null;
    const parsed = validateBackup(value.backup);
    return parsed.ok ? value as unknown as RecoverySnapshot : null;
  } catch { return null; }
}

export function restoreRecoverySnapshot(): RestoreResult {
  const snapshot = getRecoverySnapshot();
  if (!snapshot) return { ok: false, code: 'INVALID_DATA', message: '没有可用的本地恢复点' };
  return runTransaction(snapshot.backup, 'before-import');
}

export function clearRecoverySnapshot(): void { localStorage.removeItem(RECOVERY_SNAPSHOT_KEY); }
export function getLastBackupExportAt(): string | null {
  try {
    const value = localStorage.getItem(LAST_BACKUP_EXPORT_KEY);
    return isDate(value) ? value : null;
  } catch { return null; }
}
export function markBackupExported(): void { localStorage.setItem(LAST_BACKUP_EXPORT_KEY, new Date().toISOString()); }

export function resetToSeedData(): RestoreResult {
  const seed = getInitialSeedData();
  const backup: NorthlessBackupV1 = {
    kind: 'northless-backup', format_version: 1, exported_at: new Date().toISOString(),
    data: {
      tracks: seed.tracks, actions: seed.actions, logs: seed.logs,
      inbox: seed.inbox, cards: seed.cards, day_closes: seed.dayCloses,
    },
  };
  return runTransaction(backup, 'before-reset', () => {
    localStorage.setItem(STORAGE_KEYS.LAST_VISIT, JSON.stringify(getTodayDateStr()));
    localStorage.setItem(STORAGE_KEYS.SEED_SCHEMA_VERSION, String(CURRENT_SEED_SCHEMA_VERSION));
  });
}

export function checkReentryStatus(todayStr: string = getTodayDateStr()): {
  shouldPrompt: boolean;
  daysAway: number;
  lastVisitDate?: string;
} {
  const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT);
  const dismissed = localStorage.getItem(STORAGE_KEYS.REENTRY_DISMISSED_DATE);

  if (!lastVisit) {
    localStorage.setItem(STORAGE_KEYS.LAST_VISIT, todayStr);
    return { shouldPrompt: false, daysAway: 0 };
  }

  if (dismissed === todayStr) {
    return { shouldPrompt: false, daysAway: 0 };
  }

  const dToday = new Date(todayStr);
  const dLast = new Date(lastVisit);
  const diffDays = Math.floor((dToday.getTime() - dLast.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 2) {
    return {
      shouldPrompt: true,
      daysAway: diffDays,
      lastVisitDate: lastVisit,
    };
  }

  return { shouldPrompt: false, daysAway: diffDays };
}

export function dismissReentryPrompt(todayStr: string = getTodayDateStr()) {
  localStorage.setItem(STORAGE_KEYS.REENTRY_DISMISSED_DATE, todayStr);
  localStorage.setItem(STORAGE_KEYS.LAST_VISIT, todayStr);
}

export { STORAGE_KEYS };
