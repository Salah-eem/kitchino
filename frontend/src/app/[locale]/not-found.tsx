'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gold/[0.03] blur-3xl" />

      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-[120px] md:text-[180px] font-serif font-bold leading-none text-gradient mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          404
        </motion.div>

        <motion.h2
          className="text-2xl md:text-3xl font-serif font-bold text-white mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page Not Found
        </motion.h2>

        <motion.p
          className="text-gray-500 mb-8 text-base max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4 justify-center"
        >
          <Link href={`/${locale}`}>
            <Button variant="gold" size="lg">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link href={`/${locale}/products`}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4" />
              Browse Products
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
