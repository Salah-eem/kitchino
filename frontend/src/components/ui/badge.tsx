import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'gold';
  className?: string;
}

export function Badge({
  children,
  variant = 'primary',
  className = '',
}: BadgeProps) {
  const variants = {
    primary: 'bg-primary/15 text-primary border border-primary/20',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/20',
    neutral: 'bg-white/5 text-gray-400 border border-white/10',
    gold: 'bg-gold/15 text-gold border border-gold/20',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
