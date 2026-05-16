import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function AdminModal({ isOpen, onClose, title, children }: AdminModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-2xl glass p-6 md:p-8 relative z-[130] my-8 rounded-3xl"
          >
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">{title}</h2>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {children}
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
