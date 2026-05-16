'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api';
import { Order } from '@/types';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const statusMap = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.getOrderById(id as string);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-serif text-white mb-4">Order not found</h2>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const currentStatus = statusMap[order.status as keyof typeof statusMap] || statusMap.PENDING;

  return (
    <div className="min-h-screen pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-dark-card border border-dark-border hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Order Details</h1>
              <p className="text-gray-500 text-sm mt-1">ID: #{order.id.slice(0, 12).toUpperCase()}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${currentStatus.bg} ${currentStatus.color} border-current/20 font-bold text-sm`}>
            <currentStatus.icon className="w-4 h-4" />
            {currentStatus.label}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Tracking Info if Shipped */}
            {(order as any).trackingNumber && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-6 bg-gold/5 border-gold/20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-6 h-6 text-gold" />
                  <h3 className="text-white font-bold">Delivery Tracking</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tracking Number</p>
                    <p className="text-white font-mono mt-1">{(order as any).trackingNumber}</p>
                  </div>
                  {(order as any).trackingUrl && (
                    <a 
                      href={(order as any).trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gold text-sm font-bold hover:underline"
                    >
                      Track Package <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Items */}
            <div className="glass p-6">
              <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                Items
              </h3>
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark-surface border border-dark-border">
                      <Image 
                        src={item.product?.images?.[0] || item.product?.image || '/images/no-image.jpg'} 
                        alt={item.product?.name || 'Product'} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.product?.name}</h4>
                      <p className="text-gray-500 text-sm">{item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-gold">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass p-6">
              <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                Delivery Address
              </h3>
              <div className="text-sm text-gray-400 space-y-1">
                <p className="text-white font-bold">{(order.shippingAddress as any).firstName} {(order.shippingAddress as any).lastName}</p>
                <p>{(order.shippingAddress as any).street}</p>
                <p>{(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).zipCode}</p>
                <p>{(order.shippingAddress as any).country}</p>
                <p className="pt-2 text-gray-500">{(order.shippingAddress as any).phone}</p>
              </div>
            </div>

            <div className="glass p-6">
              <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-gold" />
                Order Info
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Ordered On</p>
                  <p className="text-white text-sm mt-1">{new Date(order.createdAt).toLocaleDateString(locale, { dateStyle: 'long' })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Payment Method</p>
                  <p className="text-white text-sm mt-1">Credit Card</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
