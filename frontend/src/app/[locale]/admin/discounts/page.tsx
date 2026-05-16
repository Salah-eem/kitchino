'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api';
import { Discount } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tag, 
  Percent, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminGridCard } from '@/components/admin/AdminGridCard';
import { AdminModal } from '@/components/admin/AdminModal';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const locale = useLocale();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minPurchase: '',
    maxUses: '',
    expiresAt: '',
    isActive: true,
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getDiscounts();
      setDiscounts(response.data || []);
    } catch (error) {
      toast.error('Failed to load discounts');
    } finally {
      setIsLoading(false);
    }
  };

  const confirm = useConfirm();

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm('Supprimer le coupon', 'Êtes-vous sûr de vouloir supprimer ce coupon de réduction ?');
    if (!isConfirmed) return;

    try {
      await apiClient.deleteDiscount(id);
      setDiscounts(discounts.filter(d => d.id !== id));
      toast.success('Réduction supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de la réduction');
    }
  };

  const openModal = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        code: discount.code,
        description: discount.description || '',
        type: discount.type,
        value: discount.value.toString(),
        minPurchase: discount.minPurchase?.toString() || '',
        maxUses: discount.maxUses?.toString() || '',
        expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().slice(0, 16) : '',
        isActive: discount.isActive,
      });
    } else {
      setEditingDiscount(null);
      setFormData({
        code: '', description: '', type: 'PERCENTAGE', value: '', minPurchase: '', maxUses: '', expiresAt: '', isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
      };

      if (editingDiscount) {
        await apiClient.updateDiscount(editingDiscount.id, payload);
        toast.success('Réduction mise à jour avec succès');
      } else {
        await apiClient.createDiscount(payload);
        toast.success('Réduction créée avec succès');
      }

      setIsModalOpen(false);
      fetchDiscounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDiscounts = discounts.filter(d => 
    d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputClass = "w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-black placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-all text-sm";

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Discounts" 
        subtitle="Manage promotional codes and special offers"
        actionLabel="Add Discount"
        onAction={() => openModal()}
      />

      <AdminSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search discounts by code or description..."
        totalCount={discounts.length}
        icon={<Tag className="w-5 h-5 text-gold" />}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />
          ))
        ) : filteredDiscounts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No discounts found matching your search.
          </div>
        ) : filteredDiscounts.map((discount) => (
          <AdminGridCard
            key={discount.id}
            id={discount.id}
            onEdit={() => openModal(discount)}
            onDelete={() => handleDelete(discount.id)}
            glowClass={discount.isActive ? 'bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'bg-red-500/5 group-hover:bg-red-500/10'}
            icon={<Percent className="w-6 h-6" />}
          >
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-mono font-bold text-white tracking-widest">{discount.code}</h3>
              {discount.isActive ? (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-400 bg-red-400/10 px-2 py-1 rounded">
                  <XCircle className="w-3 h-3" /> Inactive
                </span>
              )}
            </div>

            <p className="text-gray-400 text-sm mb-6 min-h-[40px] line-clamp-2">
              {discount.description || 'No description provided.'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Value</span>
                <span className="text-gold font-bold text-lg">
                  {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Uses</span>
                <span className="font-bold text-white">
                  {(discount as any).usedCount || 0} / {discount.maxUses || '∞'}
                </span>
              </div>
              {discount.expiresAt && (
                <div className="col-span-2 flex items-center gap-2 text-xs text-gray-400 mt-2 bg-white/5 p-2 rounded-lg">
                  <Calendar className="w-3 h-3 text-gold" />
                  Expires: {new Date(discount.expiresAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </AdminGridCard>
        ))}
      </div>

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title={editingDiscount ? 'Edit Discount' : 'Create Discount'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Info */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Discount Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleInputChange} required className={`${inputClass} font-mono uppercase`} placeholder="e.g. SUMMER2024" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} className={`${inputClass} resize-none`} placeholder="Internal description..." />
            </div>

            {/* Value & Type */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className={`${inputClass} appearance-none`}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Value</label>
              <input type="number" step="0.01" name="value" value={formData.value} onChange={handleInputChange} required className={inputClass} placeholder="10" />
            </div>

            {/* Restrictions */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                Min Purchase <Info className="w-3 h-3 text-gray-500" />
              </label>
              <input type="number" step="0.01" name="minPurchase" value={formData.minPurchase} onChange={handleInputChange} className={inputClass} placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                Max Uses <Info className="w-3 h-3 text-gray-500" />
              </label>
              <input type="number" name="maxUses" value={formData.maxUses} onChange={handleInputChange} className={inputClass} placeholder="Leave empty for unlimited" />
            </div>

            <div className="md:col-span-2 border-t border-white/5 pt-6 mt-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Expiration Date (Optional)</label>
              <input type="datetime-local" name="expiresAt" value={formData.expiresAt} onChange={handleInputChange} className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 accent-gold bg-dark-bg border-white/20 rounded" />
                <div>
                  <span className="block text-sm font-bold text-white">Active Status</span>
                  <span className="text-xs text-gray-500">Enable or disable this discount code immediately</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/5 mt-8">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 py-6 rounded-xl border-white/10 text-white" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 py-6 rounded-xl bg-gold hover:bg-gold/90 text-dark-bg font-bold">
              {isSubmitting ? 'Saving...' : editingDiscount ? 'Save Changes' : 'Create Discount'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
