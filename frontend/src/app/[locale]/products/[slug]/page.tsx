'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';
import { ReviewForm } from '@/components/ReviewForm';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Shield, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem: addCartItem, calculateTotals } = useCartStore();

  const [activeImage, setActiveImage] = useState(0);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getProductBySlug(slug);
        setProduct(response.data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        try {
          setReviewsLoading(true);
          const res = await apiClient.getReviewsByProduct(product.id);
          setReviews(res.data.items);
        } catch (error) {
          console.error('Failed to fetch reviews:', error);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [product?.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      if (!product) return;
      await addCartItem({
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        product,
        quantity: 1,
        price: product.price,
        subtotal: product.price,
      });
      calculateTotals();
      
      toast.success(`${product.name} ajouté au panier`, {
        action: {
          label: 'Voir le panier',
          onClick: () => window.location.href = `/${locale}/cart`,
        }
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[500px] bg-dark-card border border-dark-border rounded-2xl animate-pulse" />
          <div className="space-y-6">
            <div className="h-10 bg-dark-card rounded-xl w-3/4 animate-pulse" />
            <div className="h-6 bg-dark-card rounded-xl w-1/3 animate-pulse" />
            <div className="h-24 bg-dark-card rounded-xl w-full animate-pulse" />
            <div className="h-14 bg-dark-card rounded-xl w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-gray-400 font-serif text-xl">Product not found</p>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image || '/images/placeholder.png'];

  return (
    <div className="min-h-screen bg-dark-bg text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-dark-surface border border-white/5">
              <Image
                src={allImages[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(product.rating || 0)
                        ? 'fill-gold text-gold'
                        : 'text-gray-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-500 text-sm">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-4xl font-bold text-gold">${product.price}</span>
              {product.discount && (
                <span className="text-gray-500 line-through text-lg">
                  ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-400 mb-8 text-base leading-relaxed">
              {product.description}
            </p>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <Badge variant="success">In Stock ({product.stock} available)</Badge>
              ) : (
                <Badge variant="danger">Out of Stock</Badge>
              )}
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              variant="gold"
              size="lg"
              disabled={product.stock === 0 || isAdding}
              className="w-full text-base mb-6"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAdding ? 'Adding...' : 'Add to Cart'}
            </Button>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.div
          className="border-t border-dark-border pt-12 space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <span className="text-gold text-sm uppercase tracking-[0.2em]">Customer Feedback</span>
            <h2 className="text-3xl font-serif font-bold text-white mt-2">Reviews</h2>
            <div className="w-12 h-[1px] bg-gradient-to-r from-gold to-transparent mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-6">
              {reviewsLoading ? (
                <div className="text-gray-500 animate-pulse">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="glass p-8 text-center text-gray-500 rounded-3xl border border-white/5">
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-white">{review.user?.firstName} {review.user?.lastName}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= review.rating ? 'fill-gold text-gold' : 'text-gray-700'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 italic">"{review.comment}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="lg:col-span-5">
              <ReviewForm
                productId={product.id}
                onSubmit={async (data) => {
                  await apiClient.createReview(product.id, data);
                  // Refresh reviews after submitting
                  const res = await apiClient.getReviewsByProduct(product.id);
                  setReviews(res.data.items);
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
