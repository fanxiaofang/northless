import React, { useRef, useState } from 'react';
import { CockpitTooltip } from './CockpitTooltip';
import { InlineConfirmPopover } from './InlineConfirmPopover';

interface CockpitConfirmActionProps {
  tooltip: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  children: (props: { ref: React.RefObject<HTMLButtonElement | null>; onClick: () => void; expanded: boolean }) => React.ReactNode;
}

export const CockpitConfirmAction: React.FC<CockpitConfirmActionProps> = ({ tooltip, title, description, confirmLabel = '删除', onConfirm, children }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  return <span className="cockpit-confirm-action"><CockpitTooltip content={tooltip}>{children({ ref: anchorRef, onClick: () => setOpen(current => !current), expanded: open })}</CockpitTooltip><InlineConfirmPopover anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} onConfirm={() => { setOpen(false); onConfirm(); }} title={title} description={description} cancelLabel="取消" confirmLabel={confirmLabel} /></span>;
};
