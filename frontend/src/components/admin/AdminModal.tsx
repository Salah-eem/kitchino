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
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 xs:p-4 sm:p-6 overflow-y-auto">
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
            className="w-full max-w-2xl glass p-4 xs:p-5 sm:p-6 md:p-8 relative z-[130] my-4 xs:my-6 sm:my-8 rounded-2xl xs:rounded-3xl max-h-[calc(100vh-2rem)] xs:max-h-[calc(100vh-3rem)] overflow-y-auto"
          >
            <div className="flex justify-between items-start gap-4 mb-4 xs:mb-6 sm:mb-8 border-b border-white/5 pb-3 xs:pb-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg xs:text-xl sm:text-2xl font-serif font-bold text-white break-words">{title}</h2>
              </div>
              <button 
                type="button"
                onClick={onClose} 
                className="flex-shrink-0 p-1.5 xs:p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg xs:rounded-xl transition-colors duration-200"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 xs:w-5 xs:h-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-10rem)] xs:max-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
