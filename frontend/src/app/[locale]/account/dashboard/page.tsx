'use client';

import { useAuthStore } from '@/store/authStore';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, ShoppingBag, Heart, Settings, ArrowRight, Crown } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [statsData, setStatsData] = useState({ orders: 0, wishlist: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    const fetchStats = async () => {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          apiClient.getHistory(),
          apiClient.getWishlist(),
        ]);
        setStatsData({
          orders: ordersRes.data.length || 0,
          wishlist: wishlistRes.data.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch account stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, router, locale]);

  if (!user) return null;

  const stats = [
    { label: 'Orders', value: statsData.orders.toString(), icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
    { label: 'Wishlist', value: statsData.wishlist.toString(), icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20' },
    { label: 'Membership', value: 'None', icon: Crown, color: 'text-gold', bg: 'bg-gold/10 border-gold/20' },
  ];

  const quickLinks = [
    { label: 'Edit Profile', href: `/${locale}/account/profile`, icon: Settings },
    { label: 'Order History', href: `/${locale}/account/orders`, icon: ShoppingBag },
    { label: 'My Wishlist', href: `/${locale}/wishlist`, icon: Heart },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative py-16 border-b border-light-border dark:border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-light-card to-light-surface dark:from-dark-card dark:to-dark" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-gold/[0.08] dark:bg-gold/[0.02] blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
              <User className="w-8 h-8 text-gold" />
            </div>
            <div>
              <p className="text-gold text-sm uppercase tracking-wider font-medium">Welcome back</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.15)' }}
              className="bg-light-card border border-light-border rounded-2xl p-6 transition-all duration-500 text-slate-900 dark:bg-dark-card dark:border-dark-border dark:text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} border flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-slate-500 text-sm mt-1 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-6"
        >
          <h2 className="text-lg font-serif font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickLinks.map((link, idx) => (
              <motion.div key={idx} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={link.href}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-light-border hover:border-gold/10 transition-all group dark:bg-dark-surface dark:border-dark-border"
                >
                  <link.icon className="w-5 h-5 text-gray-500 group-hover:text-gold transition-colors dark:text-gray-400" />
                  <span className="text-slate-900 font-medium text-sm group-hover:text-gold transition-colors flex-1 dark:text-white">
                    {link.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-gold transition-colors dark:text-gray-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
