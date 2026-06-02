interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

import React from 'react';

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 mr-3">{action}</div>}
    </div>
  );
}
