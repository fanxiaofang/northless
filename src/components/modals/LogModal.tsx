import React, { useState } from 'react';
import { BookOpen, Check, Clock } from 'lucide-react';
import { EntryType, Track } from '../../types';
import { CockpitModal, CockpitModalFooter } from '../ui/CockpitModal';
import { CockpitSelect } from '../ui/CockpitSelect';
import { CockpitStepper } from '../ui/CockpitStepper';

interface LogModalProps { tracks: Track[]; onClose: () => void; onSubmit: (data: { type: EntryType; track_id?: string; content: string; duration_minutes?: number; started_at?: string; ended_at?: string }) => void; }

export const LogModal: React.FC<LogModalProps> = ({ tracks, onClose, onSubmit }) => {
  const [type, setType] = useState<EntryType>('session');
  const [trackId, setTrackId] = useState('');
  const [content, setContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [timeRange, setTimeRange] = useState('');
  const handleUseRecentTime = () => { const now = new Date(); const end = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; const past = new Date(now.getTime() - durationMinutes * 60000); const start = `${String(past.getHours()).padStart(2, '0')}:${String(past.getMinutes()).padStart(2, '0')}`; setTimeRange(`${start} — ${end}`); };
  const handleSubmit = (event: React.FormEvent) => { event.preventDefault(); if (!content.trim()) return; const parts = timeRange.split(/[-—─]/).map(part => part.trim()).filter(Boolean); onSubmit({ type, track_id: trackId || undefined, content: content.trim(), duration_minutes: type === 'session' ? durationMinutes : undefined, started_at: parts[0], ended_at: parts[1] }); onClose(); };
  const trackOptions = [{ value: '', label: type === 'session' ? '不关联主线 · 自由专注' : '不关联主线 · 随手记' }, ...tracks.map(track => ({ value: track.id, label: `${track.name} · ${track.role === 'main' ? '主线' : track.role === 'maintenance' ? '保温' : '暂缓'}` }))];
  return (
    <CockpitModal onClose={onClose} title="记一下刚刚发生了什么" subtitle="记录真实发生的事。专注与生活都可以留下痕迹。" icon={<span className="rivet" />} className="log-modal">
      <form onSubmit={handleSubmit}><div className="cockpit-modal-body log-modal-body">
        <div className="segmented-control compact log-type-selector" aria-label="记录类型">
          <button type="button" aria-pressed={type === 'session'} className={`segmented-item ${type === 'session' ? 'is-selected' : ''}`} onClick={() => setType('session')}><Clock aria-hidden="true" /><span>专注 Session</span><small>有时长，可关联主线</small></button>
          <button type="button" aria-pressed={type === 'note'} className={`segmented-item ${type === 'note' ? 'is-selected' : ''}`} onClick={() => setType('note')}><BookOpen aria-hidden="true" /><span>随手记</span><small>生活、想法与偶发事件</small></button>
        </div>
        <div className="log-form-stack">
          <label className="log-field"><span>关联主线</span><CockpitSelect value={trackId} onChange={setTrackId} options={trackOptions} ariaLabel="关联主线" /></label>
          {type === 'session' ? <div className="log-two-column"><label className="log-field"><span>时长</span><CockpitStepper value={durationMinutes} onChange={setDurationMinutes} /></label><label className="log-field"><span className="log-field-label"><span>起止时间</span><button type="button" className="log-text-action" onClick={handleUseRecentTime}>填入刚刚</button></span><input className="form-control form-control--single font-mono" placeholder="14:10 — 15:05" value={timeRange} onChange={event => setTimeRange(event.target.value)} /></label></div> : <label className="log-field"><span className="log-field-label"><span>记录时间点</span><button type="button" className="log-text-action" onClick={() => { const now = new Date(); setTimeRange(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`); }}>填入此刻</button></span><input className="form-control form-control--single font-mono" placeholder="16:30" value={timeRange} onChange={event => setTimeRange(event.target.value)} /></label>}
          <label className="log-field"><span>{type === 'session' ? '具体做了什么？' : '记下发生了什么'}</span><textarea className="form-control form-control--textarea journal-input" placeholder={type === 'session' ? '如：tool calling 跑通，完成首个天气工具调试' : '如：下午散步了一会儿，想了想下周的探索路线'} value={content} onChange={event => setContent(event.target.value)} required autoFocus /></label>
        </div>
      </div><CockpitModalFooter><button type="button" className="btn-ghost" onClick={onClose}>取消</button><button type="submit" className="brass-button" disabled={!content.trim()}><Check aria-hidden="true" /><span>记入今日时间线</span></button></CockpitModalFooter></form>
    </CockpitModal>
  );
};
