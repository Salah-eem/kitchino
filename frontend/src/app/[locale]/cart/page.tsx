'use client';

import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CartItem } from '@/types';
import { apiClient } from '@/lib/api';

export default function CartPage() {
  const { items = [], subtotal = 0, tax = 0, shipping = 0, total = 0, removeItem, updateItem, clear, fetchCart } = useCartStore();
  const locale = useLocale();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  



  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Your Selection</span>
            <h1 className="text-4xl font-serif font-bold text-white mt-2">Shopping Cart</h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold to-transparent mt-4" />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {items.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
              <ShoppingBag className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-gray-400 text-lg font-serif mb-2">Your cart is empty</p>
            <p className="text-gray-600 text-sm mb-8">Discover our premium collection</p>
            <Link href={`/${locale}/products`}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-5 p-5 mb-4 bg-dark-card border border-dark-border rounded-2xl hover:border-gold/10 transition-all group"
                  >
                    <Link href={`/${locale}/products/${item.product.id}`}>
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-dark-surface flex-shrink-0">
                        <Image 
                          src={item.product.images.length > 0 ? item.product.images[0] : '/images/no-image.jpg'} 
                          alt={item.product.name} 
                          fill 
                          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                          className="object-cover" 
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/${locale}/products/${item.product.id}`}>
                        <h3 className="font-semibold text-gray-200 hover:text-gold transition-colors truncate">{item.product.name}</h3>
                      </Link>
                      <p className="text-gray-500 text-sm mt-1">${(item.product?.price || 0).toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2 bg-dark-surface rounded-xl p-1">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateItem(item.productId, Math.max(1, item.quantity - 1))} className="p-2 hover:bg-dark-border rounded-lg transition-colors">
                        <Minus className="w-3.5 h-3.5 text-gray-400" />
                      </motion.button>
                      <span className="text-sm text-white font-medium min-w-[24px] text-center">{item.quantity}</span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateItem(item.productId, item.quantity + 1)} className="p-2 hover:bg-dark-border rounded-lg transition-colors">
                        <Plus className="w-3.5 h-3.5 text-gray-400" />
                      </motion.button>
                    </div>
                    <p className="font-bold text-gold w-24 text-right">${((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeItem(item.productId)} className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="glass-gold p-6 sticky top-24">
                <h2 className="text-lg font-serif font-bold text-white mb-6">Order Summary</h2>
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-gray-200">${(subtotal || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Tax (10%)</span><span className="text-gray-200">${(tax || 0).toFixed(2)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-gray-200">${(shipping || 0).toFixed(2)}</span></div>
                </div>
                <div className="border-t border-gold/10 pt-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="font-serif font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-gold">${(total || 0).toFixed(2)}</span>
                  </div>
                </div>
                <Link href={`/${locale}/checkout`}>
                  <Button variant="gold" size="lg" className="w-full">
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/products`} className="block text-center text-gray-500 hover:text-gold text-sm mt-4 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
