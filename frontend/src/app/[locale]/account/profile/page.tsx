'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Save, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });
  }, [user, router, locale]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.updateProfile(formData);
      setUser(response.data);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const inputClass = "w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all text-sm";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white">Profile Settings</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and account security</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="glass p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <UserIcon className="w-10 h-10 text-gold" />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">{user.firstName} {user.lastName}</h2>
            <p className="text-gray-500 text-sm">{user.role.toUpperCase()}</p>
            
            <div className="mt-6 pt-6 border-t border-dark-border space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-gold/50" />
                {user.email}
              </div>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-gold/50" />
                {user.phone || 'No phone added'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Col: Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit} className="glass p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                <input
                  type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                <input
                  type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gold/50" />
                  Email Address
                </label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleInputChange} required
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gold/50" />
                  Phone Number
                </label>
                <input
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-dark-border flex items-center justify-between">
              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-400 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Changes saved successfully
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="flex gap-4 ml-auto">
                <Button type="submit" variant="gold" size="lg" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
