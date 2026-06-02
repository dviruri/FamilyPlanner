import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  className = '',
  onClick,
  padding = 'md',
  elevated = false,
}: CardProps) {
  const base = [
    'bg-white rounded-2xl border border-gray-100',
    elevated ? 'shadow-md' : 'shadow-sm',
    paddingClasses[padding],
    onClick ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]' : '',
    className,
  ].join(' ');

  return onClick ? (
    <div role="button" tabIndex={0} className={base} onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      {children}
    </div>
  ) : (
    <div className={base}>{children}</div>
  );
}
