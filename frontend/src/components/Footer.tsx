'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ChefHat } from 'lucide-react';
import { GradientText } from './ui/gradient-text';

export function Footer() {
  const locale = useLocale();

  const footerSections = [
    {
      title: 'Quick Links',
      items: [
        { label: 'Products', href: `/${locale}/products` },
        { label: 'Contact', href: `/${locale}/contact` },
        { label: 'About Us', href: `/${locale}` },
      ],
    },
    {
      title: 'Customer Service',
      items: [
        { label: 'FAQ', href: '#' },
        { label: 'Shipping Info', href: '#' },
        { label: 'Returns', href: '#' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Privacy Policy', href: '#' },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <footer className="relative border-t border-white/5 mt-20" style={{ background: '#060606' }}>
      {/* Gold line top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Brand + Sections */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-6 h-6 text-gold" />
              <span className="text-xl font-serif font-bold">
                <GradientText animate={false}>Kitchino</GradientText>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your destination for premium kitchen equipment and culinary tools crafted for excellence.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold/50" />
                <span>hello@kitchino.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold/50" />
                <span>+1 (555) 000-0000</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold/50" />
                <span>Brussels, Belgium</span>
              </div>
            </div>
          </motion.div>

          {/* Link Sections */}
          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h3 className="text-sm font-semibold text-gold/80 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-gold text-sm transition-colors duration-300 inline-flex items-center group"
                    >
                      <span className="w-0 group-hover:w-3 h-[1px] bg-gold mr-0 group-hover:mr-2 transition-all duration-300" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        />

        {/* Bottom */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 text-xs mb-4 md:mb-0">
            &copy; 2026 Kitchino. All rights reserved. Crafted with passion.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <Link href="#" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gold transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gold transition-colors">Cookies</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
