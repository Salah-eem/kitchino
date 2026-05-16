'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api';
import { Order } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  User, 
  Calendar,
  X,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminGridCard } from '@/components/admin/AdminGridCard';
import { AdminModal } from '@/components/admin/AdminModal';

const statusOptions = [
  { value: 'PENDING', label: 'Pending', icon: Clock },
  { value: 'PROCESSING', label: 'Processing', icon: Package },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const locale = useLocale();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    trackingNumber: '',
    trackingUrl: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getAllOrders();
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      trackingUrl: order.trackingUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    setIsSubmitting(true);

    try {
      await apiClient.updateOrderStatus(editingOrder.id, formData);
      toast.success('Order updated successfully');
      setIsModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o as any).user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o as any).user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-black placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-all text-sm";

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Orders" 
        subtitle="Manage and track customer orders"
      />

      <AdminSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by Order ID or Customer Email..."
        totalCount={orders.length}
        icon={<ShoppingBag className="w-5 h-5 text-gold" />}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-white/5 animate-pulse rounded-3xl" />
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No orders found matching your search.
          </div>
        ) : filteredOrders.map((order) => (
          <AdminGridCard
            key={order.id}
            id={order.id}
            onEdit={() => openModal(order)}
            glowClass={
              order.status === 'DELIVERED' ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 
              order.status === 'CANCELLED' ? 'bg-red-500/5 group-hover:bg-red-500/10' : 
              'bg-gold/5 group-hover:bg-gold/10'
            }
            icon={<ShoppingBag className="w-6 h-6" />}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-mono font-bold text-white tracking-widest truncate max-w-[150px]">
                #{order.id.slice(-8).toUpperCase()}
              </h3>
              <span className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${
                order.status === 'DELIVERED' ? 'text-emerald-400 bg-emerald-400/10' :
                order.status === 'CANCELLED' ? 'text-red-400 bg-red-400/10' :
                'text-gold bg-gold/10'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-400">
              <p className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="truncate">{(order as any).user?.firstName} {(order as any).user?.lastName}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total Amount</span>
                <span className="text-gold font-bold flex items-center">
                  <DollarSign className="w-4 h-4" />
                  {(order as any).total?.toFixed(2) || (0).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Items</span>
                <span className="text-white font-bold">
                  {order.items?.length || 0}
                </span>
              </div>
            </div>
          </AdminGridCard>
        ))}
      </div>

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title="Update Order Details"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-dark-surface border border-white/5 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="text-white">{(editingOrder as any)?.user?.firstName} {(editingOrder as any)?.user?.lastName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="text-white">{(editingOrder as any)?.user?.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="text-white">{editingOrder ? new Date(editingOrder.createdAt).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="text-white">{(editingOrder as any)?.paymentMethod || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5 font-bold">
                  <span className="text-gray-500">Total</span>
                  <span className="text-gold">${(editingOrder as any)?.total?.toFixed(2) || (0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-surface border border-white/5 p-6 rounded-2xl max-h-64 overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Items ({editingOrder?.items?.length || 0})</h3>
              <div className="space-y-4">
                {editingOrder?.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-dark overflow-hidden flex-shrink-0">
                      {item.product?.image && <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="object-cover w-full h-full" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-bold line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-dark-surface border border-white/10 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-gold uppercase tracking-widest mb-6">Update Fulfillment</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest">Order Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 ${
                          formData.status === opt.value 
                            ? 'bg-gold/10 border-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                            : 'bg-dark border-dark-border text-gray-500 hover:border-gold/30'
                        }`}
                      >
                        <opt.icon className={`w-4 h-4 ${formData.status === opt.value ? 'text-gold' : ''}`} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Tracking Number</label>
                    <input type="text" name="trackingNumber" value={formData.trackingNumber} onChange={handleInputChange} className={inputClass} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Tracking URL</label>
                    <input type="url" name="trackingUrl" value={formData.trackingUrl} onChange={handleInputChange} className={inputClass} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/5">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 py-6 rounded-xl border-white/10 text-white" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 py-6 rounded-xl bg-gold hover:bg-gold/90 text-dark-bg font-bold">
              {isSubmitting ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
