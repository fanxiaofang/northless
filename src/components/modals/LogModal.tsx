import React, { useState } from 'react';
import { BookOpen, Check, Clock } from 'lucide-react';
import { EntryType, Track } from '../../types';
import { calculateMinutesBetween, getCurrentHHmm, subtractMinutesFromTime } from '../../lib/time';
import { CockpitModal, CockpitModalFooter } from '../ui/CockpitModal';
import { CockpitSelect } from '../ui/CockpitSelect';
import { CockpitStepper } from '../ui/CockpitStepper';
import { CockpitTimePicker } from '../ui/CockpitTimePicker';

interface LogModalProps { tracks: Track[]; onClose: () => void; onSubmit: (data: { type: EntryType; track_id?: string; content: string; duration_minutes?: number; started_at?: string; ended_at?: string }) => void; }

export const LogModal: React.FC<LogModalProps> = ({ tracks, onClose, onSubmit }) => {
  const [type, setType] = useState<EntryType>('session');
  const [trackId, setTrackId] = useState('');
  const [content, setContent] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const rangeComplete = type === 'session' && Boolean(startTime && endTime);
  const calculatedDuration = rangeComplete ? calculateMinutesBetween(startTime, endTime) : undefined;
  const invalidRange = rangeComplete && calculatedDuration === 0;

  const handleUseRecentTime = () => {
    const end = getCurrentHHmm();
    setEndTime(end);
    setStartTime(subtractMinutesFromTime(end, durationMinutes) ?? '');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || invalidRange) return;
    const hasRange = type === 'session' && Boolean(startTime && endTime);
    onSubmit({
      type,
      track_id: trackId || undefined,
      content: content.trim(),
      duration_minutes: type === 'session' ? (hasRange ? calculatedDuration : durationMinutes) : undefined,
      started_at: type === 'session' ? (hasRange ? startTime : undefined) : (startTime || undefined),
      ended_at: hasRange ? endTime : undefined,
    });
    onClose();
  };

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
          {type === 'session' ? <div className="log-two-column log-session-time-layout">
            <label className="log-field"><span>时长</span>{rangeComplete && calculatedDuration !== undefined ? <span className="log-derived-duration">{calculatedDuration}m <small>根据起止时间计算</small></span> : <CockpitStepper value={durationMinutes} onChange={setDurationMinutes} />}</label>
            <div className="log-field">
              <span>时间范围</span>
              <div className="log-time-range">
                <label className="log-time-endpoint"><span>开始</span><CockpitTimePicker value={startTime} onChange={setStartTime} ariaLabel="开始时间" /></label>
                <span className="log-time-arrow" aria-hidden="true">→</span>
                <label className="log-time-endpoint"><span>结束</span><CockpitTimePicker value={endTime} onChange={setEndTime} ariaLabel="结束时间" /></label>
              </div>
              <button type="button" className="log-text-action log-recent-action" aria-label="按时长填入刚刚的起止时间" onClick={handleUseRecentTime}>填入刚刚</button>
              {invalidRange && <span className="log-time-error" role="alert">开始和结束时间不能相同，请调整时间范围。</span>}
            </div>
          </div> : <div className="log-field">
            <span className="log-field-label"><span>记录时间点</span><button type="button" className="log-text-action" onClick={() => setStartTime(getCurrentHHmm())}>填入此刻</button></span>
            <div className="log-note-time"><CockpitTimePicker value={startTime} onChange={setStartTime} ariaLabel="记录时间点" />{startTime && <button type="button" className="log-text-action" onClick={() => setStartTime('')}>清除</button>}</div>
          </div>}
          <label className="log-field"><span>{type === 'session' ? '具体做了什么？' : '记下发生了什么'}</span><textarea className="form-control form-control--textarea journal-input" placeholder={type === 'session' ? '如：tool calling 跑通，完成首个天气工具调试' : '如：下午散步了一会儿，想了想下周的探索路线'} value={content} onChange={event => setContent(event.target.value)} required autoFocus /></label>
        </div>
      </div><CockpitModalFooter><button type="button" className="btn-ghost" onClick={onClose}>取消</button><button type="submit" className="brass-button" disabled={!content.trim() || Boolean(invalidRange)}><Check aria-hidden="true" /><span>记入今日时间线</span></button></CockpitModalFooter></form>
    </CockpitModal>
  );
};
