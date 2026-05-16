'use client';

import { ProductCard } from '@/components/ProductCard';
import { useWishlistStore } from '@/store/wishlistStore';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const { items } = useWishlistStore();
  const locale = useLocale();

  return (
    <div className="min-h-screen">
      <section className="relative py-12 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Saved Items</span>
            <h1 className="text-4xl font-serif font-bold text-white mt-2">My Wishlist</h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold to-transparent mt-4" />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center"
            >
              <Heart className="w-10 h-10 text-gray-700" />
            </motion.div>
            <p className="text-gray-400 text-lg font-serif mb-2">Your wishlist is empty</p>
            <p className="text-gray-600 text-sm mb-8">Start saving products you love</p>
            <Link href={`/${locale}/products`}>
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4" />
                Browse Products
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ProductCard product={item.product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
