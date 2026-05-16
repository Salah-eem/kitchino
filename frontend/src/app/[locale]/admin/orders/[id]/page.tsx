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
  User as UserIcon,
  Mail,
  Phone,
  CreditCard,
  ExternalLink,
  Save,
  ShoppingBag,
  DollarSign,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

const statusOptions = [
  { value: 'PENDING', label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  { value: 'PROCESSING', label: 'Processing', icon: Package, color: 'text-blue-500' },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck, color: 'text-purple-500' },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle, color: 'text-green-500' },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
];

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.getOrderById(id as string);
        const orderData = response.data;
        setOrder(orderData);
        setStatus(orderData.status);
        setTrackingNumber(orderData.trackingNumber || '');
        setTrackingUrl(orderData.trackingUrl || '');
      } catch (error) {
        console.error('Failed to fetch order:', error);
        toast.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await apiClient.updateOrderStatus(id as string, {
        status,
        trackingNumber,
        trackingUrl
      });
      toast.success('Order updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to update order:', error);
      toast.error('Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif text-white">Order not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  // Financial Calculations
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 10;
  const tax = subtotal * 0.1;
  const discount = Math.max((subtotal + shipping + tax) - order.total, 0);

  // Payment Status Logic
  const getPaymentStatus = () => {
    if (order.paymentMethod === 'COD') {
      return order.status === 'DELIVERED' ? 'PAID' : 'AWAITING PAYMENT';
    }
    return (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) ? 'PAID' : 'PENDING';
  };

  const paymentStatus = getPaymentStatus();

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-dark-card border border-dark-border hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">Edit Order</h1>
              <p className="text-gray-500 font-mono text-sm mt-1">ID: #{order.id}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${
              paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
            }`}>
              <DollarSign className="w-4 h-4" />
              {paymentStatus}
            </div>
            <div className={`px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 ${
              status === 'DELIVERED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              status === 'CANCELLED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              'bg-gold/10 text-gold border-gold/20'
            }`}>
              <Clock className="w-4 h-4" />
              {status}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Update Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6"
            >
              <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-gold" />
                Update Status & Delivery
              </h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Order Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={`p-3 rounded-xl border text-sm transition-all flex items-center gap-2 ${
                          status === opt.value 
                            ? 'bg-gold/10 border-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                            : 'bg-dark-surface border-dark-border text-gray-500 hover:border-gold/30'
                        }`}
                      >
                        <opt.icon className={`w-4 h-4 ${status === opt.value ? 'text-gold' : ''}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. DHL-12345678"
                      className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tracking URL</label>
                    <input
                      type="url"
                      value={trackingUrl}
                      onChange={(e) => setTrackingUrl(e.target.value)}
                      placeholder="https://dhl.com/track/..."
                      className="w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="gold" 
                  size="lg" 
                  className="w-full"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                  <Save className="w-4 h-4" />
                </Button>
              </form>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6"
            >
              <h2 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl bg-dark-surface border border-dark-border">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <Image 
                        src={item.product?.images?.[0] || item.product?.image || '/images/placeholder.png'} 
                        alt={item.product?.name || 'Product'} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{item.product?.name}</h4>
                      <p className="text-gray-500 text-sm">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gold font-bold">${(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Subtotal</span>
                    <span className="text-gray-200">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Shipping Fee</span>
                    <span className="text-gray-200">${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm">
                    <span>Tax (10%)</span>
                    <span className="text-gray-200">${tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500 text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>Discount Applied</span>
                      </div>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-white/5">
                    <span>Total Amount</span>
                    <span className="text-gold">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-6"
            >
              <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gold" />
                Customer Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Name</p>
                    <p className="text-white font-medium">{(order as any).user?.firstName} {(order as any).user?.lastName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-surface border border-dark-border">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
                    <p className="text-white font-medium">{(order as any).user?.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6"
            >
              <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                Shipping Address
              </h3>
              <div className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-2">
                <p className="text-white font-bold">{(order.shippingAddress as any).firstName} {(order.shippingAddress as any).lastName}</p>
                <div className="text-gray-400 text-sm leading-relaxed">
                  <p>{(order.shippingAddress as any).street}</p>
                  <p>{(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).zipCode}</p>
                  <p>{(order.shippingAddress as any).country}</p>
                </div>
                <div className="pt-3 mt-3 border-t border-white/5 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold" />
                  <span className="text-white text-sm">{(order.shippingAddress as any).phone}</span>
                </div>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6"
            >
              <h3 className="text-lg font-serif font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold" />
                Payment Information
              </h3>
              <div className="p-4 rounded-xl bg-dark-surface border border-dark-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Method</span>
                  <div className="flex items-center gap-2 text-white font-medium">
                    <CreditCard className="w-4 h-4 text-gold" />
                    {order.paymentMethod}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>
                {order.paymentIntentId && (
                  <div className="pt-3 mt-3 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Transaction ID</p>
                    <p className="text-[10px] text-gray-400 font-mono break-all">{order.paymentIntentId}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
