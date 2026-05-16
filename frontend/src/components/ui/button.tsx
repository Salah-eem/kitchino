import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden';

  const variants = {
    primary:
      'bg-gradient-to-r from-primary to-orange-500 hover:from-orange-500 hover:to-primary text-white shadow-lg hover:shadow-primary/30',
    secondary: 'bg-dark-surface hover:bg-dark-border text-gray-200 border border-dark-border',
    outline:
      'border-2 border-gold/50 text-gold hover:bg-gold/10 hover:border-gold',
    ghost: 'text-gray-300 hover:bg-white/5 hover:text-white',
    gold:
      'bg-gradient-to-r from-gold via-gold-light to-gold text-dark font-bold shadow-lg hover:shadow-gold/30',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
