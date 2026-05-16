'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Shield, Headphones, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

export default function Home() {
  const locale = useLocale();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.getProducts(1, 4);
        setFeaturedProducts(response.data.items);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      desc: 'Complimentary delivery on orders over $50',
    },
    {
      icon: Shield,
      title: 'Secure Checkout',
      desc: 'Encrypted payment processing for your safety',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      desc: 'Our concierge team is always here for you',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="relative">
      {/* ... Hero Section ... */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-luxury" />
        <div className="absolute inset-0 grid-bg" />

        {/* Gold radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gold/[0.03] blur-3xl" />

        {/* Floating decorative elements */}
        <motion.div
           className="absolute top-20 right-20 text-gold/10 text-8xl font-serif hidden lg:block"
           animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
           transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        >
          ✦
        </motion.div>
        <motion.div
           className="absolute bottom-40 left-20 text-gold/10 text-6xl font-serif hidden lg:block"
           animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
           transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ◆
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-gold/5 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Premium Kitchen Collection</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-[0.95] tracking-tight">
              <span className="text-white">Elevate Your</span>
              <br />
              <GradientText animate={false} className="text-6xl md:text-8xl lg:text-9xl">
                Culinary Art
              </GradientText>
            </h1>

            <motion.p
              className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Discover handpicked, premium kitchen equipment designed for those who appreciate
              the art of cooking.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href={`/${locale}/products`}>
                <Button variant="gold" size="lg" className="text-base px-10">
                  Explore Collection
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button variant="outline" size="lg" className="text-base px-10">
                  Get in Touch
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent" />
      </section>

      {/* Featured Products */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Curated Selection</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3">
              Featured Products
            </h2>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {isLoadingProducts ? (
              [1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-dark-card border border-dark-border rounded-2xl h-80 overflow-hidden"
                >
                  <div className="h-48 bg-gradient-to-br from-dark-surface to-dark-card animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-dark-surface rounded-lg w-3/4 animate-pulse" />
                    <div className="h-3 bg-dark-surface rounded-lg w-1/2 animate-pulse" />
                    <div className="h-5 bg-gold/10 rounded-lg w-1/3 animate-pulse" />
                  </div>
                </motion.div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href={`/${locale}/products`}>
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-card/50 to-dark" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mt-3">
              The Kitchino Promise
            </h2>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-6" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5, borderColor: 'rgba(212, 175, 55, 0.2)' }}
                className="text-center p-8 rounded-2xl border border-dark-border bg-dark-card/50 transition-all duration-500 group"
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gold/5 border border-gold/10 flex items-center justify-center group-hover:bg-gold/10 transition-colors duration-500"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="w-7 h-7 text-gold" />
                </motion.div>
                <h3 className="text-xl font-serif font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
