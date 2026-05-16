'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface ReviewFormProps {
  productId: string;
  onSubmit: (data: { rating: number; title: string; comment: string }) => Promise<void>;
}

export function ReviewForm({ productId, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, title, comment });
      setSubmitted(true);
      setTitle('');
      setComment('');
      setRating(5);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all";

  return (
    <div className="glass p-6 md:p-8">
      <h3 className="text-xl font-serif font-bold text-white mb-6">Share Your Experience</h3>

      <AnimatePresence>
        {submitted && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Thank you for your review!</span>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star} type="button" onClick={() => setRating(star)}
                whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
              >
                <Star className={`w-7 h-7 transition-colors ${star <= rating ? 'fill-gold text-gold' : 'text-gray-700'}`} />
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarize your review" required maxLength={100} className={inputClass} />
          <p className="text-xs text-gray-600 mt-1">{title.length}/100</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Review</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts..." required maxLength={500} rows={4} className={`${inputClass} resize-none`} />
          <p className="text-xs text-gray-600 mt-1">{comment.length}/500</p>
        </div>

        <Button type="submit" variant="gold" size="lg" disabled={isSubmitting || !title.trim() || !comment.trim()} className="w-full">
          {isSubmitting ? (
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>Submitting...</motion.span>
          ) : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
