'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { SearchAutocomplete } from '@/components/SearchAutocomplete';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProducts(1, 20, {
          search: searchQuery,
        });
        setProducts(response.data.items || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="relative py-16 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-card to-dark" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/[0.02] blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Our Collection</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mt-2">Products</h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold to-transparent mt-4" />
          </motion.div>

          {/* Search Bar */}
          <motion.div
            className="mt-8 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SearchAutocomplete
              onSearch={(query) => setSearchQuery(query)}
              placeholder="Search products..."
            />
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="bg-dark-card border border-dark-border rounded-2xl h-[420px] overflow-hidden"
              >
                <div className="h-56 bg-gradient-to-br from-dark-surface to-dark-card animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-dark-surface rounded-lg w-3/4 animate-pulse" />
                  <div className="h-3 bg-dark-surface rounded-lg w-full animate-pulse" />
                  <div className="h-3 bg-dark-surface rounded-lg w-1/2 animate-pulse" />
                  <div className="flex justify-between items-center pt-4 border-t border-dark-border mt-4">
                    <div className="h-6 bg-gold/10 rounded-lg w-20 animate-pulse" />
                    <div className="h-8 w-8 bg-dark-surface rounded-full animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <SlidersHorizontal className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-serif">No products found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your search criteria</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
