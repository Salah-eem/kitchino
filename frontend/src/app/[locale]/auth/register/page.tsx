'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const { setUser, setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.register(formData.email, formData.password, formData.firstName, formData.lastName);
      const { accessToken, user } = response.data;
      setToken(accessToken);
      setUser(user);
      localStorage.setItem('token', accessToken);

      // Fetch user data after registration
      const cartStore = useCartStore.getState();
      const wishlistStore = useWishlistStore.getState();
      await Promise.all([
        cartStore.fetchCart(),
        wishlistStore.fetchWishlist()
      ]);

      router.push(`/${locale}/account/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-gold p-8 md:p-10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center"
            >
              <ChefHat className="w-7 h-7 text-gold" />
            </motion.div>
            <h1 className="text-3xl font-serif font-bold text-white">Create Account</h1>
            <p className="text-gray-500 text-sm mt-2">Join the Kitchino community</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required placeholder="John" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="Doe" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="your@email.com" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required placeholder="••••••••" className={inputClass} />
              </div>
            </div>

            <Button type="submit" variant="gold" size="lg" disabled={isLoading} className="w-full mt-2">
              {isLoading ? (
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>Creating...</motion.span>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-sm">
            Already have an account?{' '}
            <Link href={`/${locale}/auth/login`} className="text-gold hover:text-gold-light font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
