import React, { useEffect, useState } from 'react';
import { TimePartSelect } from './TimePartSelect';
import { parseTime } from '../../lib/time';

interface CockpitTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export const CockpitTimePicker: React.FC<CockpitTimePickerProps> = ({ value, onChange, ariaLabel, disabled = false }) => {
  const parsed = parseTime(value);
  const [hour, setHour] = useState(parsed ? String(parsed.hour).padStart(2, '0') : '');
  const [minute, setMinute] = useState(parsed ? String(parsed.minute).padStart(2, '0') : '');

  useEffect(() => {
    const next = parseTime(value);
    setHour(next ? String(next.hour).padStart(2, '0') : '');
    setMinute(next ? String(next.minute).padStart(2, '0') : '');
  }, [value]);

  const update = (nextHour: string, nextMinute: string) => {
    setHour(nextHour);
    setMinute(nextMinute);
    if (nextHour && nextMinute) onChange(`${nextHour}:${nextMinute}`);
    else onChange('');
  };

  return <div className="cockpit-time-picker">
    <TimePartSelect type="hour" value={hour} onChange={next => update(next, minute)} ariaLabel={`${ariaLabel} · 小时`} disabled={disabled} />
    <span className="cockpit-time-picker-separator" aria-hidden="true">:</span>
    <TimePartSelect type="minute" value={minute} onChange={next => update(hour, next)} ariaLabel={`${ariaLabel} · 分钟`} disabled={disabled} />
  </div>;
};
