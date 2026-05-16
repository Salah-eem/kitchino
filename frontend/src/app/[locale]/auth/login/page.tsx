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
import { Mail, Lock, ArrowRight, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/ui/gradient-text';

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const { setUser, setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.login(formData.email, formData.password);
      const { accessToken, user } = response.data;
      setToken(accessToken);
      setUser(user);
      localStorage.setItem('token', accessToken);
      
      // Fetch user data after login
      const cartStore = useCartStore.getState();
      const wishlistStore = useWishlistStore.getState();
      await Promise.all([
        cartStore.fetchCart(),
        wishlistStore.fetchWishlist()
      ]);

      router.push(`/${locale}/account/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gold/[0.03] blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-gold p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center"
            >
              <ChefHat className="w-7 h-7 text-gold" />
            </motion.div>
            <h1 className="text-3xl font-serif font-bold text-white">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  Signing in...
                </motion.span>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* debugging button, login with admin */}
            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full"
              onClick={() => {
                setFormData({ email: 'admin@admin.com', password: 'Password1,' });
              }}

            >
              Login as Admin
            </Button>
          </form>

          <p className="text-center mt-8 text-gray-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link href={`/${locale}/auth/register`} className="text-gold hover:text-gold-light font-medium transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
