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

export type SettingsTab = 'cards' | 'data' | 'about';
const SETTINGS_TABS: readonly [SettingsTab, string][] = [
  ['cards', '手边入口'],
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
  onClose: () => void;
  initialTab?: SettingsTab;
  focusNewCard?: boolean;
  cards: Card[];
  onAddCard: (title: string, url: string, description?: string, pinned?: boolean) => void;
  onTogglePinCard: (cardId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetData: () => void;
  onOpenAiExport: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  initialTab = 'cards',
  focusNewCard = false,
  cards,
  onAddCard,
  onTogglePinCard,
  onDeleteCard,
  onExportData,
  onImportData,
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

  // Import JSON error state
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setImportStatus('数据导入成功');
      } else {
        setImportStatus('导入失败：JSON 格式不正确');
      }
    };
    reader.readAsText(file);
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

              {/* Export / Import */}
              <div className="brass-panel settings-surface p-4 space-y-4">
                <div className="type-l6 font-mono font-medium uppercase tracking-wider text-[var(--accent-brass)]">
                  本地数据备份与迁移
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onExportData}
                    className="cockpit-button cockpit-button--secondary"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
                    <span>导出 JSON 备份</span>
                  </button>

                  <button type="button" onClick={() => importInputRef.current?.click()} className="cockpit-button cockpit-button--secondary">
                    <Upload className="w-3.5 h-3.5 text-[var(--accent-brass)]" />
                    <span>导入 JSON 备份</span>
                  </button>
                  <input ref={importInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" aria-label="选择 JSON 备份文件" />
                </div>

                {importStatus && (
                  <p className="type-l6 text-[var(--accent-brass)] font-mono font-medium">{importStatus}</p>
                )}
              </div>

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
                  Gap Cockpit V0 核心原则
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
      {showResetConfirm && <CockpitModal onClose={() => setShowResetConfirm(false)} title="重置演示数据？" subtitle="当前本地数据将被替换为初始演示内容，此操作无法撤销。" className="max-w-md">
        <CockpitModalFooter><button type="button" className="cockpit-button cockpit-button--secondary" onClick={() => setShowResetConfirm(false)}>取消</button><button type="button" className="cockpit-button cockpit-button--danger" onClick={onResetData}>重置数据</button></CockpitModalFooter>
      </CockpitModal>}
    </div>
  );
};
