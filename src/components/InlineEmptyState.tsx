import React from 'react';

interface InlineEmptyStateProps {
  label: string;
  description?: string;
  className?: string;
}

/** A quiet, local system status, never a content heading or a callout. */
export const InlineEmptyState: React.FC<InlineEmptyStateProps> = ({
  label,
  description,
  className = '',
}) => (
  <div className={`inline-empty-state ${className}`.trim()} role="status">
    <p className="inline-empty-label">{label}</p>
    {description && <p className="inline-empty-description">{description}</p>}
  </div>
);
