import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CockpitSelectOption {
  value: string;
  label: string;
  meta?: string;
}

interface CockpitSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CockpitSelectOption[];
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CockpitSelect: React.FC<CockpitSelectProps> = ({
  value, onChange, options, ariaLabel, placeholder = '选择一项', className = '', disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex(option => option.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const choose = (option: CockpitSelectOption) => {
    onChange(option.value);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(options[activeIndex] ?? options[selectedIndex]);
      else { setActiveIndex(selectedIndex); setOpen(true); }
      return;
    }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : Math.min(options.length - 1, Math.max(0, activeIndex + (event.key === 'ArrowDown' ? 1 : -1)));
      setActiveIndex(next);
      if (!open) setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={`cockpit-select ${className}`}>
      <button type="button" className="cockpit-select-trigger" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listboxId} disabled={disabled} onClick={() => { setActiveIndex(selectedIndex); setOpen(current => !current); }} onKeyDown={handleKeyDown}>
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown aria-hidden="true" className="cockpit-select-chevron" />
      </button>
      {open && (
        <div id={listboxId} className="cockpit-select-options" role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => (
            <button key={option.value} type="button" role="option" aria-selected={option.value === value} className={`cockpit-select-option ${index === activeIndex ? 'is-active' : ''} ${option.value === value ? 'is-selected' : ''}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option)}>
              <span className="cockpit-select-option-copy"><span>{option.label}</span>{option.meta && <small>{option.meta}</small>}</span>
              {option.value === value && <Check aria-hidden="true" className="cockpit-select-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
