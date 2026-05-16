'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';

export default function CheckoutSuccessPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const token = searchParams.get('token'); // PayPal token

    if (orderId && token) {
      const capturePayment = async () => {
        setIsCapturing(true);
        try {
          await apiClient.capturePayment(orderId);
        } catch (error) {
          console.error('Failed to capture PayPal payment:', error);
        } finally {
          setIsCapturing(false);
        }
      };
      capturePayment();
    }
  }, [searchParams]);

  if (isCapturing) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-serif">Finalizing your payment...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      {/* Success glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-3xl" />

      <motion.div
        className="text-center max-w-lg relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </motion.div>

        <motion.h1
          className="text-4xl font-serif font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Order Placed Successfully!
        </motion.h1>

        <motion.p
          className="text-gray-400 mb-3 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Thank you for your purchase.
        </motion.p>
        <motion.p
          className="text-gray-500 mb-10 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          You will receive an email confirmation shortly with tracking information.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href={`/${locale}/account/orders`}>
            <Button variant="gold" size="lg">
              View Orders
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href={`/${locale}/products`}>
            <Button variant="outline" size="lg">
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
