import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface CockpitTooltipProps {
  content: string;
  children: React.ReactNode;
}

export const CockpitTooltip: React.FC<CockpitTooltipProps> = ({ content, children }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 8, top: 8 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current); timerRef.current = null; };
  const show = () => { clearTimer(); timerRef.current = window.setTimeout(() => setOpen(true), 300); };
  const hide = () => { clearTimer(); setOpen(false); };

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ left: Math.max(8, Math.min(rect.right - 144, window.innerWidth - 152)), top: Math.min(rect.bottom + 7, window.innerHeight - 38) });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open]);

  useEffect(() => () => clearTimer(), []);

  return <span ref={triggerRef} className="cockpit-tooltip-anchor" onMouseEnter={show} onMouseLeave={hide} onFocusCapture={show} onBlurCapture={hide} onClickCapture={hide}>
    {children}
    {open && createPortal(<span role="tooltip" className="cockpit-tooltip" style={position}>{content}</span>, document.body)}
  </span>;
};
