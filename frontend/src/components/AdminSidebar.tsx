'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Percent, 
  ChevronRight, 
  ChefHat, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { GradientText } from './ui/gradient-text';
import { useAuthStore } from '@/store/authStore';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AdminSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', href: `/${locale}/admin`, icon: LayoutDashboard },
    { label: 'Products', href: `/${locale}/admin/products`, icon: Package },
    { label: 'Orders', href: `/${locale}/admin/orders`, icon: ShoppingCart },
    { label: 'Users', href: `/${locale}/admin/users`, icon: Users },
    { label: 'Discounts', href: `/${locale}/admin/discounts`, icon: Percent },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== `/${locale}/admin` && pathname.startsWith(href));
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-dark-bg p-6">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-all">
            <ChefHat className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold leading-tight text-white">Kitchino</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Admin Panel</p>
          </div>
        </Link>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-grow">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  active
                    ? 'bg-gold/10 text-gold border border-gold/20 shadow-glow'
                    : 'text-gray-400 border border-transparent hover:bg-dark-surface hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-8 border-t border-dark-border pt-6">
        <button
          onClick={() => {
            logout();
            setIsOpen(false);
          }}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-300 text-sm font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-xl bg-dark-surface border border-gold/20 text-gold shadow-lg"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] z-[70] lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Floating) */}
      <aside className="hidden lg:block w-72 fixed top-0 left-0 bottom-0 z-40 p-4">
        <div className="h-full bg-dark-bg border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
