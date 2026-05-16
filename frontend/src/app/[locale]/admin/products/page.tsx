'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { apiClient } from '@/lib/api';
import { Product, Category } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Star,
  ExternalLink,
  X,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import Image from 'next/image';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminGridCard } from '@/components/admin/AdminGridCard';
import { AdminModal } from '@/components/admin/AdminModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const locale = useLocale();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: '', stock: '', categoryId: '', brand: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProducts(1, 100);
      setProducts(response.data.items || []);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const confirm = useConfirm();

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm('Supprimer le produit', 'Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.');
    if (!isConfirmed) return;

    try {
      await apiClient.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Produit supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.category?.id || '',
        brand: product.brand || '',
      });
      setExistingImages(product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []));
    } else {
      setEditingProduct(null);
      setFormData({ name: '', slug: '', description: '', price: '', stock: '', categoryId: '', brand: '' });
      setExistingImages([]);
    }
    setImageFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'name' && !editingProduct) {
        newData.slug = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      }
      return newData;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrls = [...existingImages];
      
      if (imageFiles.length > 0) {
        const uploadResponse = await apiClient.uploadImages(imageFiles);
        imageUrls = [...imageUrls, ...uploadResponse.data.urls];
      }

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: imageUrls,
      };

      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, payload);
        toast.success('Produit mis à jour avec succès');
      } else {
        await apiClient.createProduct(payload);
        toast.success('Produit créé avec succès');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full px-4 py-3 bg-dark-bg border border-white/10 rounded-xl text-black placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-all text-sm";

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Products" 
        subtitle="Manage your storefront inventory"
        actionLabel="Add Product"
        onAction={() => openModal()}
      />

      <AdminSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search products by name or category..."
        totalCount={products.length}
        icon={<Package className="w-5 h-5 text-gold" />}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No products found matching your search.
          </div>
        ) : filteredProducts.map((product) => (
          <AdminGridCard
            key={product.id}
            id={product.id}
            onEdit={() => openModal(product)}
            onDelete={() => handleDelete(product.id)}
            icon={
              product.images?.[0] || product.image ? (
                <Image 
                  src={product.images?.[0] || product.image} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <Package className="w-5 h-5" />
              )
            }
          >
            <h3 className="text-xl font-serif font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
            <p className="text-gray-500 text-xs font-mono mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-white/5 rounded text-gray-300">
                {product.category?.name || 'Uncategorized'}
              </span>
              <Link href={`/${locale}/products/${product.slug}`} target="_blank" className="hover:text-gold transition-colors">
                <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Price</span>
                <span className="text-gold font-bold">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Stock</span>
                <span className={`font-bold ${product.stock > 10 ? 'text-emerald-400' : product.stock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  {product.stock}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Rating</span>
                <span className="text-white flex items-center gap-1">
                  {product.rating?.toFixed(1) || '0.0'}
                  <Star className="w-3 h-3 text-gold fill-gold" />
                </span>
              </div>
            </div>
          </AdminGridCard>
        ))}
      </div>

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClass} placeholder="e.g. Premium Wagyu Beef" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Slug (URL)</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required className={inputClass} placeholder="premium-wagyu-beef" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required className={`${inputClass} appearance-none`}>
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} className={`${inputClass} resize-none`} placeholder="Detailed product description..." />
            </div>

            {/* Pricing & Inventory */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Price ($)</label>
              <input type="number" name="price" step="0.01" min="0" value={formData.price} onChange={handleInputChange} required className={inputClass} placeholder="0.00" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Stock Level</label>
              <input type="number" name="stock" min="0" value={formData.stock} onChange={handleInputChange} required className={inputClass} placeholder="100" />
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Product Images</label>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={`ext-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                    <img src={img} alt="Existing" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}
                
                {/* New Previews */}
                {imagePreviews.map((preview, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gold/50 group">
                    <img src={preview} alt="New" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                ))}

                {/* Upload Button */}
                <label className="relative aspect-square rounded-xl border border-dashed border-white/20 hover:border-gold/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center cursor-pointer">
                  <Upload className="w-6 h-6 text-gray-500 mb-2" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Upload</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-white/5 mt-8">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 py-6 rounded-xl border-white/10 text-white" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 py-6 rounded-xl bg-gold hover:bg-gold/90 text-dark-bg font-bold">
              {isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
