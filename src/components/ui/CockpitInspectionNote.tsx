import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type InspectionTone = 'brass' | 'verdigris';

interface CockpitInspectionNoteProps {
  id: string;
  title?: string;
  tone: InspectionTone;
  ariaLabel: string;
  triggerLabel?: string;
  children: React.ReactNode;
}

const InspectionPort = () => (
  <svg className="inspection-port" viewBox="0 0 14 14" aria-hidden="true">
    <path d="M5.18 1.86a5.32 5.32 0 1 0 4.97 1.18" />
    <path d="M10.43 1.78v1.38h1.38" />
    <circle cx="7" cy="7" r="1.05" />
  </svg>
);

export const CockpitInspectionNote: React.FC<CockpitInspectionNoteProps> = ({
  id,
  title,
  tone,
  ariaLabel,
  triggerLabel,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number; side: 'top' | 'bottom' }>({ left: 16, top: 16, side: 'bottom' });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const leaveTimerRef = useRef<number | null>(null);
  const isOpen = isPinned || isHovered;

  const clearLeaveTimer = () => {
    if (leaveTimerRef.current !== null) {
      window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
  };

  const scheduleHoverClose = () => {
    if (isPinned) return;
    clearLeaveTimer();
    leaveTimerRef.current = window.setTimeout(() => setIsHovered(false), 90);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const anchor = triggerRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const noteHeight = noteRef.current?.offsetHeight || 176;
      const width = Math.min(320, window.innerWidth - 32);
      const left = Math.max(16, Math.min(anchor.left, window.innerWidth - width - 16));
      const shouldFlip = anchor.bottom + 9 + noteHeight > window.innerHeight - 16 && anchor.top - 9 - noteHeight >= 16;
      setPosition({ left, top: shouldFlip ? anchor.top - 9 - noteHeight : anchor.bottom + 9, side: shouldFlip ? 'top' : 'bottom' });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsidePress = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !noteRef.current?.contains(target)) {
        setIsPinned(false);
        setIsHovered(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsPinned(false);
        setIsHovered(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => () => clearLeaveTimer(), []);

  return (
    <span className={`cockpit-inspection-note tone-${tone}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`inspection-note-trigger ${isOpen ? 'is-open' : ''}`}
        aria-label={ariaLabel}
        aria-controls={id}
        aria-describedby={isOpen ? id : undefined}
        aria-expanded={isOpen}
        onClick={() => { setIsPinned(current => !current); setIsHovered(false); }}
        onMouseEnter={() => { clearLeaveTimer(); if (!isPinned) setIsHovered(true); }}
        onMouseLeave={scheduleHoverClose}
        onFocus={() => { clearLeaveTimer(); if (!isPinned) setIsHovered(true); }}
        onBlur={() => { if (!isPinned) setIsHovered(false); }}
      >
        {triggerLabel && <span>{triggerLabel}</span>}
        <InspectionPort />
      </button>
      {isOpen && createPortal(
        <div
          ref={noteRef}
          id={id}
          role="tooltip"
          className={`cockpit-inspection-popover tone-${tone} side-${position.side}`}
          style={{ left: position.left, top: position.top }}
          onMouseEnter={clearLeaveTimer}
          onMouseLeave={scheduleHoverClose}
        >
          {title && <p className="inspection-note-title">{title}</p>}
          {title && <span className="inspection-note-hairline" aria-hidden="true" />}
          <div className="inspection-note-body">{children}</div>
        </div>,
        document.body
      )}
    </span>
  );
};
