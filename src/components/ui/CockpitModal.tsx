import React from 'react';
import { X } from 'lucide-react';

interface CockpitModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const CockpitModal: React.FC<CockpitModalProps> = ({ children, onClose, title, subtitle, icon, className = '' }) => (
  <div className="cockpit-modal-overlay" role="presentation">
    <div className={`cockpit-modal-panel ${className}`} role="dialog" aria-modal="true" aria-label={title}>
      {(title || subtitle) && <header className="cockpit-modal-header">
        <div className="cockpit-modal-heading">{icon && <span className="cockpit-modal-icon">{icon}</span>}<div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div></div>
        <button type="button" className="cockpit-modal-close" onClick={onClose} aria-label="关闭"><X aria-hidden="true" /></button>
      </header>}
      {children}
    </div>
  </div>
);

export const CockpitModalFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => <footer className="cockpit-modal-footer">{children}</footer>;
