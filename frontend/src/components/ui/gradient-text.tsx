import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  variant?: 'gold' | 'primary';
}

export function GradientText({
  children,
  className = '',
  animate = true,
  variant = 'gold',
}: GradientTextProps) {
  const gradients = {
    gold: 'from-gold via-gold-light to-gold',
    primary: 'from-primary via-orange-400 to-red-400',
  };

  return (
    <span
      className={`bg-gradient-to-r ${gradients[variant]} bg-clip-text text-transparent ${
        animate ? 'animate-pulse-glow' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
}
