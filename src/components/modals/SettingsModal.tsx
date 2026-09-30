import React, { useState } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Pin,
  PinOff
} from 'lucide-react';
import { Card, Phase, Track } from '../../types';

interface SettingsModalProps {
  onClose: () => void;
  phases: Phase[];
  currentPhaseId: string;
  onSelectPhase: (phaseId: string) => void;
  onCreatePhase: (name: string, note?: string) => void;
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
  phases,
  currentPhaseId,
  onSelectPhase,
  onCreatePhase,
  cards,
  onAddCard,
  onTogglePinCard,
  onDeleteCard,
  onExportData,
  onImportData,
  onResetData,
  onOpenAiExport,
}) => {
  const [activeTab, setActiveTab] = useState<'phase' | 'cards' | 'data' | 'about'>('phase');

  // New Phase Form
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseNote, setNewPhaseNote] = useState('');

  // New Card Form
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardUrl, setNewCardUrl] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [newCardPinned, setNewCardPinned] = useState(true);

  // Import JSON error state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCreatePhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName.trim()) return;
    onCreatePhase(newPhaseName.trim(), newPhaseNote.trim() || undefined);
    setNewPhaseName('');
    setNewPhaseNote('');
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim() || !newCardUrl.trim()) return;
    onAddCard(newCardTitle.trim(), newCardUrl.trim(), newCardDesc.trim() || undefined, newCardPinned);
    setNewCardTitle('');
    setNewCardUrl('');
    setNewCardDesc('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setImportStatus('数据导入成功！页面将自动刷新。');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('导入失败：JSON 格式不正确');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="brass-panel-elevated p-6 rounded-lg max-w-2xl w-full h-[80vh] flex flex-col border border-[#c69956]/40 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-hero)]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pb-4 border-b border-[#c69956]/20">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#dfbf85]" />
            <h3 className="font-display text-lg font-semibold text-[var(--text-hero)]">
              驾驶舱配置与本地数据
            </h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            本地优先 (Local-First)。数据完全保留在你的浏览器本地，无隐私外泄与云端依赖。
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 py-3 border-b border-[#c69956]/15 text-xs">
          <button
            onClick={() => setActiveTab('phase')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'phase'
                ? 'bg-[#2b241c] text-[var(--text-hero)] border border-[#c69956]/40 font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            探索阶段 (Phase)
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'cards'
                ? 'bg-[#2b241c] text-[var(--text-hero)] border border-[#c69956]/40 font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            手边入口 (Cards)
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'data'
                ? 'bg-[#2b241c] text-[var(--text-hero)] border border-[#c69956]/40 font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            数据备份 / 导入
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'about'
                ? 'bg-[#2b241c] text-[var(--text-hero)] border border-[#c69956]/40 font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            设计宪章 (Charter)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
          {activeTab === 'phase' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
                  选择当前活跃阶段
                </div>
                <div className="space-y-2">
                  {phases.map(p => {
                    const isCurrent = p.id === currentPhaseId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => onSelectPhase(p.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          isCurrent
                            ? 'brass-panel-elevated border-[#c69956]/60'
                            : 'brass-panel hover:border-[#c69956]/30'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                            <span>{p.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] text-[#dfbf85] px-1.5 py-0.2 bg-[#2d241a] rounded border border-[#c69956]/30">
                                活跃
                              </span>
                            )}
                          </div>
                          {p.note && <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{p.note}</p>}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)]">
                          自 {p.started_at}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Create New Phase */}
              <form onSubmit={handleCreatePhase} className="brass-panel p-4 rounded-lg space-y-3">
                <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
                  开启新探索阶段
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] mb-1">阶段名称</label>
                  <input
                    type="text"
                    placeholder="如: Job Hunting 冲刺期"
                    value={newPhaseName}
                    onChange={e => setNewPhaseName(e.target.value)}
                    className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] mb-1">阶段目标备注 (可选)</label>
                  <input
                    type="text"
                    placeholder="如: 重点转向简历包装、项目实战复盘与算法高频题巩固。"
                    value={newPhaseNote}
                    onChange={e => setNewPhaseNote(e.target.value)}
                    className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
                  />
                </div>
                <button
                  type="submit"
                  className="brass-button px-4 py-1.5 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#dfbf85]" />
                  <span>添加新阶段</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="space-y-6">
              {/* Existing Cards */}
              <div className="space-y-2">
                <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
                  已收拢的手边入口
                </div>
                <div className="space-y-2">
                  {cards.map(card => (
                    <div
                      key={card.id}
                      className="brass-panel p-3 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                          <span>{card.title}</span>
                          {card.pinned && (
                            <span className="text-[10px] text-[#dfbf85] font-mono">固定在侧边栏</span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate max-w-sm">
                          {card.url}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onTogglePinCard(card.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[#dfbf85] transition-colors rounded"
                          title={card.pinned ? '取消固定' : '固定到侧边栏'}
                        >
                          {card.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onDeleteCard(card.id)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[#e06c75] transition-colors rounded"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Card */}
              <form onSubmit={handleCreateCard} className="brass-panel p-4 rounded-lg space-y-3">
                <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
                  收拢新入口
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">入口标题</label>
                    <input
                      type="text"
                      placeholder="如: Technical English"
                      value={newCardTitle}
                      onChange={e => setNewCardTitle(e.target.value)}
                      className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">目标 URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newCardUrl}
                      onChange={e => setNewCardUrl(e.target.value)}
                      className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] mb-1">简要描述</label>
                  <input
                    type="text"
                    placeholder="如: 技术文档与常用素材"
                    value={newCardDesc}
                    onChange={e => setNewCardDesc(e.target.value)}
                    className="w-full bg-[#11100f] border border-[#c69956]/25 rounded px-3 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-[#dfbf85]"
                  />
                </div>
                <button
                  type="submit"
                  className="brass-button px-4 py-1.5 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#dfbf85]" />
                  <span>添加至手边</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              {/* AI Context Exporter */}
              <div className="brass-panel p-4 rounded-lg space-y-2">
                <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
                  人工 AI · 上下文导出
                </div>
                <p className="text-[var(--text-secondary)]">
                  无需绑定 API Key 或依赖远程 AI Agent。一键生成完整的阶段现状、主线进展与 7 天记录 Markdown，直接粘贴给外部大模型协助复盘。
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAiExport();
                  }}
                  className="brass-button px-4 py-2 font-semibold text-[var(--text-hero)] rounded flex items-center gap-2 mt-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#dfbf85]" />
                  <span>生成并复制 AI Prompt</span>
                </button>
              </div>

              {/* Export / Import */}
              <div className="brass-panel p-4 rounded-lg space-y-4">
                <div className="text-xs font-display uppercase tracking-wider text-[#c69956]">
                  本地数据备份与迁移
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onExportData}
                    className="brass-button px-4 py-1.5 font-semibold text-[var(--text-hero)] rounded flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#dfbf85]" />
                    <span>导出 JSON 备份</span>
                  </button>

                  <label className="px-4 py-1.5 rounded bg-[#201c18] hover:bg-[#2b241c] border border-[#c69956]/30 text-[var(--text-primary)] cursor-pointer flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#dfbf85]" />
                    <span>导入 JSON 备份</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {importStatus && (
                  <p className="text-xs text-[#dfbf85] font-mono">{importStatus}</p>
                )}
              </div>

              {/* Reset to Seed */}
              <div className="p-4 rounded-lg border border-[#e06c75]/25 bg-[#251515]/30 space-y-2">
                <div className="text-xs font-display uppercase tracking-wider text-[#e06c75]">
                  重置演示数据
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  清空当前改动并恢复初始的 Agent / 算法 / Linux 演示数据。
                </p>
                <button
                  onClick={() => {
                    if (confirm('确定要重置为初始演示数据吗？')) {
                      onResetData();
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1.5 rounded text-xs text-[#e06c75] bg-[#3a1d1d] hover:bg-[#4a2424] border border-[#e06c75]/40 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>恢复初始种子数据</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed">
              <div className="brass-panel p-4 rounded-lg space-y-2">
                <div className="font-display font-bold text-sm text-[var(--text-hero)]">
                  Gap Cockpit V0 核心原则
                </div>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>No-AI-first</strong>: 没有 AI 也必须完整好用，确定性算分保障稳定可解释。
                  </li>
                  <li>
                    <strong>Low-maintenance</strong>: 使用它不能本身成为一项工作。允许 Inbox 腐烂，不设 streak，不搞任务欠账。
                  </li>
                  <li>
                    <strong>Beautiful enough to return</strong>: 结合 Linear 的克制、Raycast 的速度与复古蒸汽朋克仪表盘质感，提供安心深邃的沉浸体验。
                  </li>
                  <li>
                    <strong>生活可以被记录，但不必被管理</strong>: 散步、游戏、放空都是真实的一天，不必强行塞入考核。
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
