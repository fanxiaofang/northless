import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

interface TimePartSelectProps {
  type: 'hour' | 'minute';
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
}

const makeOptions = (count: number) => [
  { value: '', label: '--' },
  ...Array.from({ length: count }, (_, index) => {
    const label = String(index).padStart(2, '0');
    return { value: label, label };
  }),
];

const hourOptions = makeOptions(24);
const minuteOptions = makeOptions(60);
const PANEL_WIDTH = 78;
const PANEL_HEIGHT = 248;

export const TimePartSelect: React.FC<TimePartSelectProps> = ({ type, value, onChange, ariaLabel, disabled = false }) => {
  const options = type === 'hour' ? hourOptions : minuteOptions;
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const keyboardNavRef = useRef(true);
  const listboxId = useId();

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const anchor = rootRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const height = listRef.current?.offsetHeight ?? PANEL_HEIGHT;
      setPosition({
        left: Math.max(8, Math.min(anchor.left, window.innerWidth - PANEL_WIDTH - 8)),
        top: anchor.bottom + 4 + height <= window.innerHeight - 8
          ? anchor.bottom + 4
          : Math.max(8, anchor.top - height - 4),
      });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !listRef.current || !keyboardNavRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>(`[data-time-index="${activeIndex}"]`);
    if (active) listRef.current.scrollTop = active.offsetTop - (listRef.current.clientHeight - active.offsetHeight) / 2;
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, [open]);

  const choose = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') { if (open) event.preventDefault(); setOpen(false); return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(activeIndex);
      else { keyboardNavRef.current = true; setActiveIndex(selectedIndex); setOpen(true); }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const base = open ? activeIndex : selectedIndex;
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
        : Math.min(options.length - 1, Math.max(0, base + (event.key === 'ArrowDown' ? 1 : -1)));
      keyboardNavRef.current = true;
      setActiveIndex(next);
      setOpen(true);
    }
  };

  return <div ref={rootRef} className="time-part-select">
    <button ref={triggerRef} type="button" className="time-part-trigger" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listboxId} aria-activedescendant={open ? `${listboxId}-${activeIndex}` : undefined} disabled={disabled} onClick={() => { keyboardNavRef.current = true; setActiveIndex(selectedIndex); setOpen(current => !current); }} onKeyDown={handleKeyDown}>
      <span>{options[selectedIndex].label}</span><ChevronDown aria-hidden="true" />
    </button>
    {open && createPortal(<div ref={listRef} id={listboxId} className="time-part-options" role="listbox" aria-label={ariaLabel} style={position}>
      {options.map((option, index) => <button key={option.label} id={`${listboxId}-${index}`} type="button" role="option" tabIndex={-1} data-time-index={index} aria-selected={index === selectedIndex} className={`time-part-option ${index === activeIndex ? 'is-active' : ''} ${index === selectedIndex ? 'is-selected' : ''}`} onMouseEnter={() => { keyboardNavRef.current = false; setActiveIndex(index); }} onClick={() => choose(index)}>
        <span>{option.label}</span>{index === selectedIndex && <Check aria-hidden="true" />}
      </button>)}
    </div>, document.body)}
  </div>;
};
