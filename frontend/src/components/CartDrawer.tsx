'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, total, removeItem, updateItem } = useCartStore();
  const locale = useLocale();

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-dark-card border-l border-dark-border z-50 flex flex-col"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-dark-border">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-gold" />
                <h2 className="text-lg font-serif font-bold text-white">Cart</h2>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white p-1 transition-colors">
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-700 mb-4" />
                  <p className="text-gray-400 font-medium">Your cart is empty</p>
                  <p className="text-gray-600 text-sm mt-1">Start shopping</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-3 p-3 mb-3 rounded-xl bg-dark-surface border border-dark-border hover:border-gold/10 transition-all"
                    >
                      <Link href={`/${locale}/products/${item.product.slug}`}>
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-dark-card flex-shrink-0">
                          <Image src={item.product.image || '/images/placeholder.png'} alt={item.product.name} fill className="object-cover" />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-200 truncate">{item.product.name}</h3>
                        <p className="text-gold font-bold text-sm mt-0.5">${item.subtotal.toFixed(2)}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <button onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))} className="p-1 hover:bg-dark-border rounded transition-colors">
                            <Minus className="w-3 h-3 text-gray-500" />
                          </button>
                          <span className="text-xs text-gray-300 min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1 hover:bg-dark-border rounded transition-colors">
                            <Plus className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 p-1 transition-colors self-start">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-dark-border p-6 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-400 font-medium">Total</span>
                  <span className="text-gold text-2xl font-bold">${total.toFixed(2)}</span>
                </div>
                <Button variant="gold" size="lg" className="w-full" onClick={() => setIsOpen(false)}>
                  <Link href={`/${locale}/checkout`} className="w-full text-center flex items-center justify-center gap-2">
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-gold to-gold-dark text-dark p-4 rounded-2xl shadow-2xl z-40 flex items-center justify-center"
      >
        <ShoppingCart className="w-5 h-5" />
        {items.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
          >
            {items.length}
          </motion.span>
        )}
      </motion.button>
    </>
  );
}
