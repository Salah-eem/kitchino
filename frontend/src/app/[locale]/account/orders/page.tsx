'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Order } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/login?redirect=account/orders`);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await apiClient.getHistory();
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, router, locale]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'shipped': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gold/60" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gold/10 text-gold border-gold/20';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <section className="relative py-12 border-b border-white/5 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-gold text-sm uppercase tracking-[0.2em] font-medium">Your Journey</span>
            <h1 className="text-4xl font-serif font-bold text-white mt-2">Order History</h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold to-transparent mt-4" />
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {orders.length === 0 ? (
          <motion.div
            className="glass p-12 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-700" />
            </div>
            <p className="text-gray-400 text-lg font-serif mb-2">No orders found</p>
            <p className="text-gray-600 text-sm mb-8">You haven't placed any orders yet</p>
            <Link href={`/${locale}/products`}>
              <Button variant="gold" size="lg">Start Shopping</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass group hover:border-gold/20 transition-all duration-500 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center group-hover:border-gold/10 transition-colors">
                          <Package className="w-6 h-6 text-gold/60" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Order Reference</p>
                          <h3 className="text-white font-mono font-bold">#{order.id.slice(0, 8).toUpperCase()}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Placed On</p>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-gold/40" />
                            <span className="text-sm">{new Date(order.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${getStatusStyles(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/5">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Items</p>
                        <p className="text-gray-200 font-medium">{order.items.length} Product{order.items.length > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Total Amount</p>
                        <p className="text-gold font-bold">${order.total.toFixed(2)}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Shipping To</p>
                        <p className="text-gray-300 text-sm truncate">
                          {(order.shippingAddress as any).street}, {(order.shippingAddress as any).city}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-dark-card overflow-hidden bg-dark-surface">
                            <img src={item.product?.images?.[0] || item.product?.image || '/images/placeholder.png'} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-10 h-10 rounded-full border-2 border-dark-card bg-dark-surface flex items-center justify-center text-[10px] text-gray-400 font-bold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <Link href={`/${locale}/account/orders/${order.id}`} className="block">
                        <Button variant="outline" size="sm" className="group/btn">
                          View Order Details
                          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
