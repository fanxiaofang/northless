import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface InlineConfirmPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
}

export const InlineConfirmPopover: React.FC<InlineConfirmPopoverProps> = ({ anchorRef, open, onClose, onConfirm, title, description, cancelLabel, confirmLabel }) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 8, top: 8 });

  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const width = popoverRef.current?.offsetWidth || 236;
      const height = popoverRef.current?.offsetHeight || 112;
      if (!anchor) return;
      const left = Math.max(8, Math.min(anchor.right - width, window.innerWidth - width - 8));
      const top = anchor.bottom + 8 + height <= window.innerHeight - 8 ? anchor.bottom + 8 : Math.max(8, anchor.top - height - 8);
      setPosition({ left, top });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [anchorRef, open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => { const target = event.target as Node; if (!popoverRef.current?.contains(target) && !anchorRef.current?.contains(target)) onClose(); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { onClose(); anchorRef.current?.focus(); } };
    document.addEventListener('mousedown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('mousedown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [anchorRef, onClose, open]);

  if (!open) return null;
  return createPortal(<div ref={popoverRef} className="inline-confirm-popover" style={position} role="dialog" aria-label={title}>
    <p className="inline-confirm-title">{title}</p><p className="inline-confirm-description">{description}</p>
    <div className="inline-confirm-actions"><button type="button" className="inline-confirm-cancel" onClick={onClose}>{cancelLabel}</button><button type="button" className="inline-confirm-destructive" onClick={onConfirm}>{confirmLabel}</button></div>
  </div>, document.body);
};
