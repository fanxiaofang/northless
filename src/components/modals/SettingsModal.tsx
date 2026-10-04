import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Pin,
  PinOff
} from 'lucide-react';
import { Card } from '../../types';
import { CockpitTooltip } from '../ui/CockpitTooltip';
import { CockpitModal, CockpitModalFooter } from '../ui/CockpitModal';
import { CockpitConfirmAction } from '../ui/CockpitConfirmAction';
import type { ThemeMode } from '../../lib/themePreference';
import { getLastBackupExportAt, getRecoverySnapshot, parseBackup,
  type NorthlessBackupV1, type RecoverySnapshot, type RestoreResult } from '../../lib/storage';

export type SettingsTab = 'cards' | 'appearance' | 'data' | 'about';
const SETTINGS_TABS: readonly [SettingsTab, string][] = [
  ['cards', '手边入口'],
  ['appearance', '外观'],
  ['data', '数据备份'],
  ['about', '设计宪章'],
];

const isValidCardUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

interface SettingsModalProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onClose: () => void;
  initialTab?: SettingsTab;
  focusNewCard?: boolean;
  cards: Card[];
  dataCounts: { tracks: number; actions: number; logs: number; inbox: number; cards: number };
  onAddCard: (title: string, url: string, description?: string, pinned?: boolean) => void;
  onTogglePinCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onExportData: () => void;
  onImportData: (backup: NorthlessBackupV1) => RestoreResult;
  onRestoreRecovery: () => RestoreResult;
  onResetData: () => RestoreResult;
  onOpenAiExport: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  theme,
  onThemeChange,
  onClose,
  initialTab = 'cards',
  focusNewCard = false,
  cards,
  dataCounts,
  onAddCard,
  onTogglePinCard,
  onDeleteCard,
  onExportData,
  onImportData,
  onRestoreRecovery,
  onResetData,
  onOpenAiExport,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const newCardFormRef = useRef<HTMLFormElement>(null);
  const newCardTitleRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // New Card Form
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardUrl, setNewCardUrl] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [newCardPinned, setNewCardPinned] = useState(true);
  const [cardTitleTouched, setCardTitleTouched] = useState(false);
  const [cardUrlTouched, setCardUrlTouched] = useState(false);

  const [pendingBackup, setPendingBackup] = useState<NorthlessBackupV1 | null>(null);
  const [backupParseError, setBackupParseError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [lastExportAt, setLastExportAt] = useState(getLastBackupExportAt);
  const [recoverySnapshot, setRecoverySnapshot] = useState<RecoverySnapshot | null>(getRecoverySnapshot);
  const [showRecoveryConfirm, setShowRecoveryConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const formatDate = (value: string) => new Date(value).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  const refreshMetadata = () => {
    setRecoverySnapshot(getRecoverySnapshot());
    setLastExportAt(getLastBackupExportAt());
  };

  useEffect(() => {
    if (!focusNewCard || activeTab !== 'cards') return;
    const frame = requestAnimationFrame(() => {
      newCardFormRef.current?.scrollIntoView({ block: 'nearest' });
      newCardTitleRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeTab, focusNewCard]);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !isValidCardUrl(newCardUrl.trim())) {
      setCardTitleTouched(true);
      setCardUrlTouched(true);
      return;
    }
    onAddCard(newCardTitle.trim(), newCardUrl.trim(), newCardDesc.trim() || undefined, newCardPinned);
    setNewCardTitle('');
    setNewCardUrl('');
    setNewCardDesc('');
    setCardTitleTouched(false);
    setCardUrlTouched(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setPendingBackup(null);
    setBackupParseError(null);
    setRestoreStatus(null);
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result;
      const parsed = parseBackup(typeof content === 'string' ? content : '');
      if (parsed.ok) setPendingBackup(parsed.backup);
      else setBackupParseError(parsed.message);
    };
    reader.onerror = () => setBackupParseError('无法读取备份文件，请重新选择');
    reader.readAsText(file);
  };

  const handleRestore = () => {
    if (!pendingBackup) return;
    const result = onImportData(pendingBackup);
    refreshMetadata();
    if (!result.ok) { setRestoreStatus(result.message); return; }
    setRestoreStatus(`已从 ${formatDate(pendingBackup.exported_at)} 的备份恢复。`);
    setPendingBackup(null);
  };

  return (
    <div className="cockpit-modal-overlay">
      <div className="cockpit-modal-panel settings-modal p-6 max-w-2xl w-full h-[80vh] flex flex-col relative" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button
          type="button"
          onClick={onClose}
          className="cockpit-icon-button cockpit-icon-button--neutral absolute top-4 right-4"
          aria-label="关闭设置"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[var(--border-accent-muted)]">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[var(--accent-brass)]" />
            <h3 id="settings-title" className="type-l3 font-semibold text-[var(--text-hero)]">
              设置与本地数据
            </h3>
          </div>
          <p className="type-l5 text-[var(--text-secondary)] font-sans mt-1">
            本地优先。数据保留在浏览器本地，不依赖云端同步。
          </p>
        </div>

        {/* Tabs */}
        <div className="py-3 border-b border-[var(--border-accent-subtle)] overflow-x-auto">
          <div className="segmented-control compact" role="tablist" aria-label="设置分类">
            {SETTINGS_TABS.map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`settings-tab-${tab}`}
                aria-controls={activeTab === tab ? `settings-panel-${tab}` : undefined}
                aria-selected={activeTab === tab}
                tabIndex={activeTab === tab ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={event => {
                  const currentIndex = SETTINGS_TABS.findIndex(([key]) => key === tab);
                  const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % SETTINGS_TABS.length
                    : event.key === 'ArrowLeft' ? (currentIndex - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length
                      : event.key === 'Home' ? 0 : event.key === 'End' ? SETTINGS_TABS.length - 1 : -1;
                  if (nextIndex < 0) return;
                  event.preventDefault();
                  const nextTab = SETTINGS_TABS[nextIndex][0];
                  setActiveTab(nextTab);
                  document.getElementById(`settings-tab-${nextTab}`)?.focus();
                }}
                className={`segmented-item ${activeTab === tab ? 'is-selected' : ''}`}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-6 type-l5 font-sans">
          {activeTab === 'appearance' && (
            <div id="settings-panel-appearance" role="tabpanel" aria-labelledby="settings-tab-appearance" className="space-y-3">
              <div className="font-medium text-[var(--text-title)]">主题</div>
              <div className="segmented-control compact" role="group" aria-label="主题">
                {(['dark', 'light'] as const).map(mode => (
                  <button key={mode} type="button" aria-pressed={theme === mode}
                    className={`segmented-item ${theme === mode ? 'is-selected' : ''}`}
                    onClick={() => onThemeChange(mode)}>
                    {mode === 'dark' ? '深色' : '浅色'}
                  </button>
                ))}
              </div>
              <p className="text-[var(--text-secondary)]">选择工作台的明暗外观。设置保存在当前浏览器。</p>
            </div>
          )}
          {activeTab === 'cards' && (
            <div id="settings-panel-cards" role="tabpanel" aria-labelledby="settings-tab-cards" className="space-y-6">
              {/* Existing Cards */}
              <div className="space-y-2">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">
                  已收拢的手边入口
                </div>
                <div className="space-y-2">
                  {cards.map(card => (
                    <div
                      key={card.id}
                      className="brass-panel settings-surface p-3 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="font-semibold text-[var(--text-primary)] truncate">{card.title}</div>
                        {card.description && <div className="type-l6 text-[var(--text-secondary)] truncate">{card.description}</div>}
                        <div className="type-l6 text-[var(--text-muted)] font-mono truncate">
                          {card.url}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <CockpitTooltip content={card.pinned ? '取消固定' : '固定到侧边栏'}><button
                          onClick={() => onTogglePinCard(card.id)}
                          className="cockpit-icon-button cockpit-icon-button--neutral"
                          aria-label={card.pinned ? '取消固定' : '固定到侧边栏'}
                          aria-pressed={card.pinned}
                        >
                          {card.pinned ? <PinOff /> : <Pin />}
                        </button></CockpitTooltip>
                        <CockpitConfirmAction tooltip="删除入口" title="删除这个入口？" description="这个手边入口将被永久移除。" onConfirm={() => onDeleteCard(card.id)}>{({ ref, onClick, expanded }) => <button
                          ref={ref}
                          onClick={onClick}
                          className="cockpit-icon-button cockpit-icon-button--danger"
                          aria-label="删除入口"
                          aria-expanded={expanded}
                        >
                          <Trash2 />
                        </button>}</CockpitConfirmAction>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Card */}
              <form ref={newCardFormRef} noValidate onSubmit={handleCreateCard} className="brass-panel settings-surface p-4 space-y-3">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">
                  收拢新入口
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="min-w-0">
                    <label htmlFor="new-card-title" className="block text-[var(--text-muted)] mb-1 font-medium">入口标题</label>
                    <input
                      ref={newCardTitleRef}
                      id="new-card-title"
                      type="text"
                      placeholder="如: Technical English"
                      value={newCardTitle}
                      onChange={e => setNewCardTitle(e.target.value)}
                      onBlur={() => setCardTitleTouched(true)}
                      aria-invalid={cardTitleTouched && !newCardTitle.trim()}
                      aria-describedby={cardTitleTouched && !newCardTitle.trim() ? 'card-title-error' : undefined}
                      className="form-slot min-h-9 px-3 py-1.5 font-medium"
                    />
                    {cardTitleTouched && !newCardTitle.trim() && <p id="card-title-error" className="cockpit-inline-error">请输入入口标题</p>}
                  </div>
                  <div className="min-w-0">
                    <label htmlFor="new-card-url" className="block text-[var(--text-muted)] mb-1 font-medium">目标 URL</label>
                    <input
                      id="new-card-url"
                      type="url"
                      placeholder="https://..."
                      value={newCardUrl}
                      onChange={e => setNewCardUrl(e.target.value)}
                      onBlur={() => setCardUrlTouched(true)}
                      aria-invalid={cardUrlTouched && !isValidCardUrl(newCardUrl.trim())}
                      aria-describedby={cardUrlTouched && !isValidCardUrl(newCardUrl.trim()) ? 'card-url-error' : undefined}
                      className="form-slot min-h-9 px-3 py-1.5 font-medium"
                    />
                    {cardUrlTouched && !isValidCardUrl(newCardUrl.trim()) && <p id="card-url-error" className="cockpit-inline-error">请输入有效的网址</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] mb-1 font-medium">简要描述</label>
                  <input
                    type="text"
                    placeholder="如: 技术文档与常用素材"
                    value={newCardDesc}
                    onChange={e => setNewCardDesc(e.target.value)}
                    className="form-slot min-h-9 px-3 py-1.5 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="cockpit-button cockpit-button--primary"
                >
                  <Plus className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
                  <span>添加至手边</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'data' && (
            <div id="settings-panel-data" role="tabpanel" aria-labelledby="settings-tab-data" className="space-y-6">
              <div className="surface-flat settings-surface p-4 space-y-1">
                <div className="font-medium text-[var(--text-title)]">本地数据</div>
                <p className="text-[var(--text-secondary)] leading-relaxed">Northless 的个人数据保存在此浏览器，不依赖云端同步。清除网站数据或更换设备前，请先导出完整备份。</p>
              </div>
              {/* Context Exporter */}
              <div className="brass-panel settings-surface p-4 space-y-2">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">
                  当前上下文
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  将主线状态、活跃 Next 与最近记录整理为 Markdown，可复制到 AI、笔记或其他工具。
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAiExport();
                  }}
                  className="cockpit-button cockpit-button--brass-action mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
                  <span>生成当前上下文</span>
                </button>
              </div>

              <div className="brass-panel settings-surface p-4 space-y-3">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">
                  完整备份
                </div>
                <p className="text-[var(--text-secondary)]">{dataCounts.tracks} 条主线 · {dataCounts.logs} 条记录 · {dataCounts.inbox} 个收集项</p>
                <p className="type-l6 text-[var(--text-muted)]">{lastExportAt ? `最近导出：${formatDate(lastExportAt)}` : '尚未导出过备份'}</p>
                <button type="button" onClick={() => { try { onExportData(); refreshMetadata(); setBackupParseError(null); } catch (error) { setBackupParseError(`导出失败：${String(error)}`); } }} className="cockpit-button cockpit-button--secondary">
                  <Download className="w-3.5 h-3.5 text-[var(--accent-brass)]" /><span>导出完整备份</span>
                </button>
              </div>

              <div className="brass-panel settings-surface p-4 space-y-3">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">从备份恢复</div>
                <button type="button" onClick={() => importInputRef.current?.click()} className="cockpit-button cockpit-button--secondary">
                  <Upload className="w-3.5 h-3.5 text-[var(--accent-brass)]" /><span>选择 Northless 备份</span>
                </button>
                <input ref={importInputRef} type="file" accept=".json,application/json" onChange={handleFileUpload} className="hidden" aria-label="选择 Northless 备份文件" />
                {backupParseError && <p role="alert" className="cockpit-inline-error">{backupParseError}</p>}
                {pendingBackup && <div className="surface-flat p-3 space-y-2">
                  <p className="font-medium text-[var(--text-primary)]">备份时间：{formatDate(pendingBackup.exported_at)}</p>
                  <p className="text-[var(--text-secondary)]">Tracks {pendingBackup.data.tracks.length} · Actions {pendingBackup.data.actions.length} · Logs {pendingBackup.data.logs.length} · Inbox {pendingBackup.data.inbox.length} · Cards {pendingBackup.data.cards.length}</p>
                  <p className="text-[var(--text-secondary)]">这会替换当前浏览器中的 Northless 数据。</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="cockpit-button cockpit-button--secondary" onClick={() => { setPendingBackup(null); setRestoreStatus(null); }}>取消</button>
                    <button type="button" className="cockpit-button cockpit-button--primary" onClick={handleRestore}>恢复此备份</button>
                  </div>
                </div>}
                {restoreStatus && <p role="status" className="type-l6 text-[var(--accent-brass)] font-medium">{restoreStatus}</p>}
              </div>

              {recoverySnapshot && <div className="brass-panel settings-surface p-4 space-y-2">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">上一个本地恢复点</div>
                <p className="text-[var(--text-primary)]">{formatDate(recoverySnapshot.created_at)} · {recoverySnapshot.reason === 'before-import' ? '导入备份前自动保存' : '重置数据前自动保存'}</p>
                <p className="text-[var(--text-secondary)]">{recoverySnapshot.backup.data.tracks.length} 条主线 · {recoverySnapshot.backup.data.logs.length} 条记录 · {recoverySnapshot.backup.data.inbox.length} 个收集项</p>
                <button type="button" className="cockpit-button cockpit-button--secondary" onClick={() => setShowRecoveryConfirm(true)}>恢复到这个状态</button>
              </div>}

              {/* Reset to Seed */}
              <div className="brass-panel settings-surface p-4 space-y-2">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--status-danger)]">
                  重置演示数据
                </div>
                <p className="type-l5 text-[var(--text-secondary)]">
                  清空当前改动并恢复初始的 Agent / 算法 / Linux 演示数据。
                </p>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="cockpit-button cockpit-button--danger"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>恢复初始种子数据</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div id="settings-panel-about" role="tabpanel" aria-labelledby="settings-tab-about" className="space-y-4 type-l5 text-[var(--text-secondary)] leading-relaxed">
              <div className="brass-panel settings-surface p-4 space-y-3">
                <div className="font-display font-semibold type-l4 text-[var(--text-hero)]">
                  Northless 核心原则
                </div>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-[var(--text-primary)]">AI 非前置</strong>：没有 AI 也必须完整可用，确定性算分保障稳定、可解释。
                  </li>
                  <li>
                    <strong className="text-[var(--text-primary)]">低维护</strong>：使用它不能本身成为一项工作。允许 Inbox 腐烂，不设 streak，不制造任务欠账。
                  </li>
                  <li>
                    <strong className="text-[var(--text-primary)]">值得回来</strong>：结合克制的软件结构、快速交互与复古工业仪表盘质感，让驾驶舱保持安静、可靠。
                  </li>
                  <li>
                    <strong className="text-[var(--text-primary)]">生活可以被记录，但不必被管理</strong>：散步、游戏、放空都是真实的一天，不必强行塞入考核。
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      {showRecoveryConfirm && <CockpitModal onClose={() => setShowRecoveryConfirm(false)} title="恢复到本地恢复点？" subtitle="当前数据将被替换。" className="max-w-md">
        <CockpitModalFooter><button type="button" className="cockpit-button cockpit-button--secondary" onClick={() => setShowRecoveryConfirm(false)}>取消</button><button type="button" className="cockpit-button cockpit-button--primary" onClick={() => {
          const result = onRestoreRecovery();
          setShowRecoveryConfirm(false);
          setRestoreStatus(result.ok ? '已恢复到上一个本地恢复点。' : result.message);
          refreshMetadata();
        }}>确认恢复</button></CockpitModalFooter>
      </CockpitModal>}
      {showResetConfirm && <CockpitModal onClose={() => setShowResetConfirm(false)} title="重置演示数据？" subtitle="当前本地数据将被替换为初始演示内容。重置前会自动保存一个本地恢复点。" className="max-w-md">
        <CockpitModalFooter><button type="button" className="cockpit-button cockpit-button--secondary" onClick={() => setShowResetConfirm(false)}>取消</button><button type="button" className="cockpit-button cockpit-button--danger" onClick={() => {
          const result = onResetData();
          if (!result.ok) { setRestoreStatus(result.message); setShowResetConfirm(false); refreshMetadata(); }
        }}>重置数据</button></CockpitModalFooter>
      </CockpitModal>}
    </div>
  );
};
