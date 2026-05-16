import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  animated?: boolean;
  variant?: 'default' | 'glass' | 'gold';
}

export function Card({
  children,
  className = '',
  hoverable = true,
  animated = true,
  variant = 'default',
}: CardProps) {
  const variants = {
    default: 'bg-dark-card border border-dark-border',
    glass: 'glass',
    gold: 'glass-gold',
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 20 } : {}}
      whileInView={animated ? { opacity: 1, y: 0 } : {}}
      whileHover={hoverable ? { y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' } : {}}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className={`rounded-2xl transition-all duration-500 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
