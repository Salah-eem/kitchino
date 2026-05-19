'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Trash2, 
  MessageSquare,
  Search,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useConfirm } from '@/hooks/use-confirm';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminGridCard } from '@/components/admin/AdminGridCard';
import { useLocale } from 'next-intl';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AdminReviewsPage() {
  const locale = useLocale();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await apiClient.getReviews(1, 50); // Get latest 50 reviews
      setReviews(res.data.items);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const confirm = useConfirm();
  const handleDelete = async (id: string) => {
    const isConfirmed = await confirm("Delete Review", "Are you sure you want to delete this review?");
    if (!isConfirmed) return;
    try {
      await apiClient.deleteReviewAdmin(id);
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not delete review');
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader 
        title="Reviews Moderation" 
        subtitle="Manage and moderate customer reviews across all products"
      />

      <AdminSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by comment, product, or customer..."
        totalCount={reviews.length}
        icon={<MessageSquare className="w-5 h-5 text-gold" />}
      />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 animate-pulse rounded-3xl" />
          ))
        ) : filteredReviews.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            No reviews found matching your search.
          </div>
        ) : filteredReviews.map((review) => (
          <AdminGridCard
            key={review.id}
            id={review.id}
            onDelete={() => handleDelete(review.id)}
            glowClass="bg-gold/5 group-hover:bg-gold/10"
            icon={<MessageSquare className="w-6 h-6" />}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  {review.user.firstName} {review.user.lastName}
                </h3>
                <Link 
                  href={`/${locale}/products/${review.product.slug}`} 
                  target="_blank"
                  className="text-xs text-gold hover:underline flex items-center gap-1 mt-1"
                >
                  {review.product.name}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${star <= review.rating ? 'text-gold fill-gold' : 'text-gray-700'}`} 
                />
              ))}
            </div>

            <p className="text-gray-300 text-sm flex-grow italic">
              "{review.comment || 'No written comment'}"
            </p>
            
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-600 font-mono">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </div>
          </AdminGridCard>
        ))}
      </div>
    </div>
  );
}
