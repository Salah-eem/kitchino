'use client';

import { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useConfirm } from '@/hooks/use-confirm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminGridCard } from '@/components/admin/AdminGridCard';
import { AdminModal } from '@/components/admin/AdminModal';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const confirm = useConfirm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.getCategories();
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiClient.updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await apiClient.createCategory(formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '' });
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm("Delete Category", "Are you sure you want to delete this category? It must be empty.");
    if (!isConfirmed) return;
    try {
      await apiClient.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not delete category');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Categories" 
        subtitle="Organize your products into logical groups"
        actionLabel="Add Category"
        onAction={() => {
          setEditingCategory(null);
          setFormData({ name: '', slug: '' });
          setIsModalOpen(true);
        }}
      />

      <AdminSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search categories by name..."
        totalCount={categories.length}
        icon={<Folder className="w-5 h-5 text-gold" />}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No categories found matching your search.
          </div>
        ) : filteredCategories.map((category) => (
          <AdminGridCard
            key={category.id}
            id={category.id}
            icon={<Folder className="w-6 h-6" />}
            onEdit={() => {
              setEditingCategory(category);
              setFormData({ name: category.name, slug: category.slug });
              setIsModalOpen(true);
            }}
            onDelete={() => handleDelete(category.id)}
          >
            <h3 className="text-xl font-serif font-bold text-white mb-1">{category.name}</h3>
            <p className="text-gray-500 text-xs font-mono mb-4">/{category.slug}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Products</span>
              <span className="text-gold font-bold">{category._count?.products || 0}</span>
            </div>
          </AdminGridCard>
        ))}
      </div>

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCategory ? 'Edit Category' : 'New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                setFormData({ ...formData, name, slug: editingCategory ? formData.slug : slug });
              }}
              placeholder="e.g. Italian Pizzas"
              className="w-full bg-dark-surface border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:border-gold/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Slug (URL)</label>
            <input 
              type="text" 
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-dark-surface border border-white/10 rounded-xl py-4 px-6 text-white outline-none focus:border-gold/50 font-mono text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              variant="outline" 
              className="flex-1 py-6 rounded-xl border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 py-6 rounded-xl bg-gold hover:bg-gold/90 text-dark-bg font-bold"
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
