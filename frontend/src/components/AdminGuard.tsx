'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/store/authStore';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait for hydration or store persistence
    if (!token || !user) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (user.role !== 'ADMIN') {
      router.push(`/${locale}`);
      return;
    }

    setIsAuthorized(true);
  }, [user, token, router, locale]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
