'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addItem: addWishlistItem, removeItem } = useWishlistStore();
  const { addItem: addCartItem, calculateTotals } = useCartStore();
  const { user } = useAuthStore();
  const locale = useLocale();
  const [isAdding, setIsAdding] = useState(false);
  
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addWishlistItem({
        id: `${product.id}-wishlist`,
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      await addCartItem({
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
        subtotal: product.price,
      });
      calculateTotals();
      
      toast.success(`${product.name} ajouté au panier`, {
        action: {
          label: 'Voir le panier',
          onClick: () => window.location.href = `/${locale}/cart`,
        }
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex flex-col h-full hover:border-gold/20 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    >
      {/* Image Container */}
      <div className="relative w-full h-56 bg-gradient-to-br from-dark-surface to-dark-card overflow-hidden">
        <Link href={`/${locale}/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.images?.[0] || product.image || '/images/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {product.discount && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: 0 }}
            className="absolute top-3 right-3"
          >
            <Badge variant="danger">-{product.discount}%</Badge>
          </motion.div>
        )}

        {/* Quick add overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAdding}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gold text-dark font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500 disabled:opacity-70 pointer-events-auto"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
            {isAdding ? 'Adding...' : 'Quick Add'}
          </motion.button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="text-base font-semibold text-gray-200 hover:text-gold truncate transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 flex-grow">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center mt-3 space-x-2">
          <div className="flex text-gold gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'fill-gold text-gold'
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 text-xs">({product.reviewCount})</span>
        </div>

        {/* Price + Wishlist */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-dark-border">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gold">${product.price}</span>
            {product.discount && (
              <span className="text-xs text-gray-600 line-through">
                ${(product.price / (1 - product.discount / 100)).toFixed(2)}
              </span>
            )}
          </div>
          <motion.button
            onClick={handleWishlistToggle}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              inWishlist
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-white/5 text-gray-500 hover:text-gold hover:bg-gold/10 border border-transparent hover:border-gold/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
