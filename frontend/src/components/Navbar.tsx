'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Heart, 
  LogOut, 
  Menu, 
  X, 
  ChefHat, 
  LayoutDashboard,
  ShieldCheck,
  Package,
  Users,
  Percent,
  ChevronRight,
  ArrowLeft,
  ListPlus,
  MessageSquare,
  Moon,
  Sun
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useTheme } from '@/context/ThemeContext';

function NavbarContent() {
  const { user, logout } = useAuthStore();
  const { items = [], clear: clearCart } = useCartStore();
  const { clear: clearWishlist } = useWishlistStore();
  const { theme, toggleTheme } = useTheme();
  const locale = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await clearCart(false);
    clearWishlist();
    logout();
    setIsOpen(false);
  };

  const cartCount = (items || []).reduce((acc, item) => acc + (item.quantity || 0), 0);
  const isAdmin = user?.role === 'ADMIN';
  const isAdminRoute = pathname.includes(`/${locale}/admin`);

  const mainLinks = [
    { label: 'Products', href: `/${locale}/products` },
    { label: 'About', href: `/${locale}/about` },
  ];

  const loggedInLinks = [
    { label: 'Products', href: `/${locale}/products` },
    { label: 'Orders', href: `/${locale}/orders` },
    { label: 'Account', href: `/${locale}/account` },
    { label: 'Profile', href: `/${locale}/profile` },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: `/${locale}/admin`, icon: LayoutDashboard },
    { label: 'Products', href: `/${locale}/admin/products`, icon: Package },
    { label: 'Categories', href: `/${locale}/admin/categories`, icon: ListPlus },
    { label: 'Orders', href: `/${locale}/admin/orders`, icon: ShoppingCart },
    { label: 'Users', href: `/${locale}/admin/users`, icon: Users },
    { label: 'Discounts', href: `/${locale}/admin/discounts`, icon: Percent },
    { label: 'Reviews', href: `/${locale}/admin/reviews`, icon: MessageSquare },
  ];

  const activeLinks = isAdminRoute ? adminLinks : user ? loggedInLinks : mainLinks;

  return (
    <>
      {/* Admin Mode Bar */}
      {isAdmin && (
        <div className={`bg-gold text-dark-bg py-1 px-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.2em] z-[110] relative transition-all ${isAdminRoute ? 'bg-emerald-500' : ''}`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            {isAdminRoute ? 'Admin Control Panel' : 'Storefront - Admin Mode'}
          </div>
          <div className="flex gap-4">
            {isAdminRoute ? (
              <Link href={`/${locale}`} className="flex items-center gap-1 hover:opacity-80">
                <ArrowLeft className="w-3 h-3" /> Back to Store
              </Link>
            ) : (
              <Link href={`/${locale}/admin`} className="hover:underline">Dashboard</Link>
            )}
          </div>
        </div>
      )}

      <nav className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${
        isAdmin ? 'top-6' : 'top-0'
      } ${scrolled ? 'py-4 glass shadow-2xl border-b border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}${isAdminRoute ? '/admin' : ''}`} className="flex items-center gap-3 group z-[110]">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:border-gold/40 transition-all">
              <ChefHat className="w-6 h-6 text-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold text-white tracking-widest leading-none">KITCHINO</span>
              {isAdminRoute && <span className="text-[8px] text-gold font-sans uppercase tracking-[0.3em] mt-1 font-bold">Admin</span>}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {activeLinks.map((link) => {
              const Icon = (link as any).icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                    pathname === link.href ? 'text-gold' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {isAdminRoute && Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 z-[110]">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="hidden sm:inline-flex p-2 text-gray-400 hover:text-gold bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-gold/30 transition-all duration-200"
              aria-pressed={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {!isAdminRoute && (
              <div className="hidden sm:flex items-center gap-4 mr-2 border-r border-white/10 pr-6">
                <Link href={`/${locale}/wishlist`} className="relative group p-2">
                  <Heart className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                </Link>
                <Link href={`/${locale}/cart`} className="relative group p-2">
                  <ShoppingCart className="w-5 h-5 text-gray-400 group-hover:text-gold transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-[10px] text-dark-bg font-bold flex items-center justify-center rounded-full border-2 border-dark-bg">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/account/dashboard`}>
                  <div className="flex items-center gap-3 bg-surface border border-surface rounded-full pl-4 pr-1.5 py-1.5 hover:border-gold/50 transition-all group">
                    <span className="text-[10px] font-bold text-muted group-hover:text-body hidden sm:block uppercase tracking-wider">
                      {user.firstName}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold text-xs font-bold border border-gold/20">
                      {user.firstName[0]}
                    </div>
                  </div>
                </Link>
                <button onClick={handleLogout} className="p-2 text-muted hover:text-red-400 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href={`/${locale}/auth/login`}>
                <Button variant="gold" size="sm" className="px-6 rounded-full font-bold h-9">Login</Button>
              </Link>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-body bg-surface border border-surface rounded-xl shadow-sm hover:bg-surface/90 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-dark-bg/98 backdrop-blur-2xl border-b border-white/10 lg:hidden overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-4">
                  {isAdminRoute ? 'Admin Management' : 'Navigation'}
                </div>
                {activeLinks.map((link) => {
                  const Icon = (link as any).icon;
                  return (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        {isAdminRoute && Icon && (
                          <Icon className={`w-6 h-6 ${pathname === link.href ? 'text-gold' : 'text-gray-500'}`} />
                        )}
                        <span className={`text-2xl font-serif font-bold ${pathname === link.href ? 'text-gold' : 'text-white'}`}>
                          {link.label}
                        </span>
                      </div>
                      <ChevronRight className="w-6 h-6 text-gold opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  );
                })}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-3xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={`h-24 ${isAdmin ? 'mt-6' : ''}`} />
    </>
  );
}

export function Navbar() {
  return <NavbarContent />;
}
