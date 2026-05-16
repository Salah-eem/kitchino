import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminGridCardProps {
  id: string;
  icon?: ReactNode;
  glowClass?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  children: ReactNode;
}

export function AdminGridCard({
  id,
  icon,
  glowClass = 'bg-gold/5 group-hover:bg-gold/10',
  onEdit,
  onDelete,
  children
}: AdminGridCardProps) {
  return (
    <motion.div
      layout
      key={id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-6 group hover:border-gold/20 transition-all relative overflow-hidden flex flex-col"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl transition-all pointer-events-none ${glowClass}`} />
      
      <div className="flex justify-between items-start mb-6">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gold/10 border border-gold/20 flex items-center justify-center text-gold flex-shrink-0">
          {icon}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {children}
    </motion.div>
  );
}
