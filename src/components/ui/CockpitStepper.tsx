import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface CockpitStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  ariaLabel?: string;
}

export const CockpitStepper: React.FC<CockpitStepperProps> = ({ value, onChange, min = 5, step = 5, ariaLabel = '时长，分钟' }) => (
  <div className="cockpit-stepper">
    <input aria-label={ariaLabel} className="form-control form-control--single cockpit-stepper-input font-mono" type="number" min={min} step={step} value={value} onChange={event => onChange(Math.max(min, Number(event.target.value) || min))} />
    <span className="cockpit-stepper-unit">min</span>
    <button type="button" aria-label={`减少 ${step} 分钟`} className="cockpit-stepper-button" onClick={() => onChange(Math.max(min, value - step))}><Minus aria-hidden="true" /></button>
    <button type="button" aria-label={`增加 ${step} 分钟`} className="cockpit-stepper-button" onClick={() => onChange(value + step)}><Plus aria-hidden="true" /></button>
  </div>
);
