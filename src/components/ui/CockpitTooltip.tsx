import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface CockpitTooltipProps { content: string; children: React.ReactNode; }

export const CockpitTooltip: React.FC<CockpitTooltipProps> = ({ content, children }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const clearTimer = () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); timerRef.current = null; };
  const show = () => { clearTimer(); timerRef.current = window.setTimeout(() => setOpen(true), 300); };
  const hide = () => { clearTimer(); setOpen(false); };

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      const tooltip = tooltipRef.current?.getBoundingClientRect();
      if (!anchor || !tooltip) return;
      const gutter = 8;
      const left = Math.max(gutter, Math.min(anchor.left + anchor.width / 2 - tooltip.width / 2, window.innerWidth - tooltip.width - gutter));
      const bottomFits = anchor.bottom + gutter + tooltip.height <= window.innerHeight - gutter;
      const top = bottomFits ? anchor.bottom + gutter : Math.max(gutter, anchor.top - tooltip.height - gutter);
      setPosition({ left, top });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open, content]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { hide(); triggerRef.current?.querySelector<HTMLElement>('button, [tabindex]')?.focus(); } };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  useEffect(() => () => clearTimer(), []);

  return <span ref={triggerRef} className="cockpit-tooltip-anchor" onMouseEnter={show} onMouseLeave={hide} onFocusCapture={show} onBlurCapture={hide} onClickCapture={hide}>
    {children}
    {open && createPortal(<span ref={tooltipRef} role="tooltip" className="cockpit-tooltip" style={position}>{content}</span>, document.body)}
  </span>;
};
