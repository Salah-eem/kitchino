import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  title?: string;
  className?: string;
}

export function Alert({
  children,
  variant = 'default',
  title,
  className = '',
}: AlertProps) {
  const variants = {
    default: 'bg-gray-50 text-gray-700 border-gray-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const iconMap = {
    default: AlertCircle,
    success: CheckCircle,
    destructive: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = iconMap[variant];
  const colors = {
    default: 'text-gray-400',
    success: 'text-green-400',
    destructive: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-4 flex gap-4 ${variants[variant]} ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors[variant]}`} />
      <div>
        {title && <h3 className="font-semibold">{title}</h3>}
        {children}
      </div>
    </motion.div>
  );
}
