import {
  ActiveSession,
  Card,
  DayClose,
  InboxItem,
  LogEntry,
  NextAction,
  Phase,
  Track
} from '../types';
import { getTodayDateStr } from './recommendation';

const STORAGE_KEYS = {
  PHASES: 'gap_cockpit_phases_v0',
  CURRENT_PHASE_ID: 'gap_cockpit_current_phase_id_v0',
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

const CURRENT_SEED_SCHEMA_VERSION = 3;

const LEGACY_PHASE_NOTES: Record<string, { legacy: string; replacement: string }> = {
  phase_agent: {
    legacy: '聚焦现代 Agent 与协议生态，打造具备展示度的求职硬核项目。',
    replacement: '以 Agent 项目为主轴，同时保温算法、Linux/C 与求职准备，形成可持续推进的技术探索节奏。',
  },
  phase_job: {
    legacy: '重点转向简历包装、项目实战复盘与算法高频题巩固。',
    replacement: '求职成为当前主方向，围绕项目包装、技术复盘、算法巩固与沟通准备集中推进。',
  },
};

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

  const initialPhases: Phase[] = [
    {
      id: 'phase_agent',
      name: 'AI / Agent Exploration',
      started_at: '2026-09-01',
      note: '以 Agent 项目为主轴，同时保温算法、Linux/C 与求职准备，形成可持续推进的技术探索节奏。',
    },
    {
      id: 'phase_job',
      name: 'Job Hunting 冲刺期',
      started_at: '2026-11-01',
      note: '求职成为当前主方向，围绕项目包装、技术复盘、算法巩固与沟通准备集中推进。',
    },
  ];

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
      description: '用于观察较长路线如何连续折返，并同时呈现已完成、当前与未来阶段。',
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
  ];

  const initialLogs: LogEntry[] = [
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
      content: '继续梳理产品结构，明确 Gap Cockpit 核心流与复古朋克风格',
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
    phases: initialPhases,
    currentPhaseId: 'phase_agent',
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
  if (localStorage.getItem(STORAGE_KEYS.SEED_SCHEMA_VERSION) === String(CURRENT_SEED_SCHEMA_VERSION)) {
    return;
  }

  const phases = loadData<Phase[]>(STORAGE_KEYS.PHASES, []);
  const tracks = loadData<Track[]>(STORAGE_KEYS.TRACKS, []);
  let phasesChanged = false;
  let tracksChanged = false;

  const migratedPhases = phases.map(phase => {
    const migration = LEGACY_PHASE_NOTES[phase.id];
    if (!migration || phase.note !== migration.legacy) return phase;

    phasesChanged = true;
    return { ...phase, note: migration.replacement };
  });

  let migratedTracks = tracks.map(track => {
    const migration = LEGACY_TRACK_DESCRIPTIONS[track.id];
    if (!migration || track.description !== migration.legacy) return track;

    tracksChanged = true;
    return { ...track, description: migration.replacement };
  });

  if (!migratedTracks.some(track => track.id === 'track_snake_demo')) {
    const snakeDemo = getInitialSeedData().tracks.find(track => track.id === 'track_snake_demo');
    if (snakeDemo) {
      migratedTracks = [...migratedTracks, snakeDemo];
      tracksChanged = true;
    }
  }

  if (phasesChanged) saveData(STORAGE_KEYS.PHASES, migratedPhases);
  if (tracksChanged) saveData(STORAGE_KEYS.TRACKS, migratedTracks);
  localStorage.setItem(STORAGE_KEYS.SEED_SCHEMA_VERSION, String(CURRENT_SEED_SCHEMA_VERSION));
}

export function initializeStorageIfNeeded() {
  if (!localStorage.getItem(STORAGE_KEYS.TRACKS)) {
    const seed = getInitialSeedData();
    saveData(STORAGE_KEYS.PHASES, seed.phases);
    saveData(STORAGE_KEYS.CURRENT_PHASE_ID, seed.currentPhaseId);
    saveData(STORAGE_KEYS.TRACKS, seed.tracks);
    saveData(STORAGE_KEYS.ACTIONS, seed.actions);
    saveData(STORAGE_KEYS.LOGS, seed.logs);
    saveData(STORAGE_KEYS.INBOX, seed.inbox);
    saveData(STORAGE_KEYS.CARDS, seed.cards);
    saveData(STORAGE_KEYS.DAY_CLOSES, seed.dayCloses);
    saveData(STORAGE_KEYS.LAST_VISIT, getTodayDateStr());
  }

  migrateSeedDataIfNeeded();
}

export function resetToSeedData() {
  const seed = getInitialSeedData();
  saveData(STORAGE_KEYS.PHASES, seed.phases);
  saveData(STORAGE_KEYS.CURRENT_PHASE_ID, seed.currentPhaseId);
  saveData(STORAGE_KEYS.TRACKS, seed.tracks);
  saveData(STORAGE_KEYS.ACTIONS, seed.actions);
  saveData(STORAGE_KEYS.LOGS, seed.logs);
  saveData(STORAGE_KEYS.INBOX, seed.inbox);
  saveData(STORAGE_KEYS.CARDS, seed.cards);
  saveData(STORAGE_KEYS.DAY_CLOSES, seed.dayCloses);
  saveData(STORAGE_KEYS.ACTIVE_SESSION, null);
  saveData(STORAGE_KEYS.LAST_VISIT, getTodayDateStr());
  localStorage.setItem(STORAGE_KEYS.SEED_SCHEMA_VERSION, String(CURRENT_SEED_SCHEMA_VERSION));
  return seed;
}

export function exportAllData() {
  return {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    phases: loadData(STORAGE_KEYS.PHASES, []),
    current_phase_id: loadData(STORAGE_KEYS.CURRENT_PHASE_ID, 'phase_agent'),
    tracks: loadData(STORAGE_KEYS.TRACKS, []),
    actions: loadData(STORAGE_KEYS.ACTIONS, []),
    logs: loadData(STORAGE_KEYS.LOGS, []),
    inbox: loadData(STORAGE_KEYS.INBOX, []),
    cards: loadData(STORAGE_KEYS.CARDS, []),
    day_closes: loadData(STORAGE_KEYS.DAY_CLOSES, []),
  };
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.tracks && Array.isArray(data.tracks)) {
      saveData(STORAGE_KEYS.TRACKS, data.tracks);
    }
    if (data.actions && Array.isArray(data.actions)) {
      saveData(STORAGE_KEYS.ACTIONS, data.actions);
    }
    if (data.logs && Array.isArray(data.logs)) {
      saveData(STORAGE_KEYS.LOGS, data.logs);
    }
    if (data.inbox && Array.isArray(data.inbox)) {
      saveData(STORAGE_KEYS.INBOX, data.inbox);
    }
    if (data.cards && Array.isArray(data.cards)) {
      saveData(STORAGE_KEYS.CARDS, data.cards);
    }
    if (data.phases && Array.isArray(data.phases)) {
      saveData(STORAGE_KEYS.PHASES, data.phases);
    }
    if (data.current_phase_id) {
      saveData(STORAGE_KEYS.CURRENT_PHASE_ID, data.current_phase_id);
    }
    if (data.day_closes && Array.isArray(data.day_closes)) {
      saveData(STORAGE_KEYS.DAY_CLOSES, data.day_closes);
    }
    return true;
  } catch (err) {
    console.error('Failed to import JSON data:', err);
    return false;
  }
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
