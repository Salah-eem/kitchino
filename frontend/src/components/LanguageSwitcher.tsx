'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import { supportedLocales, switchLocalePath } from '@/lib/localePaths';

interface LanguageSwitcherProps {
  onChange?: () => void;
  className?: string;
}

const labels: Record<string, string> = {
  en: 'EN',
  fr: 'FR',
};

export function LanguageSwitcher({ onChange, className = '' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname() || `/${locale}`;
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface p-1 ${className}`}>
      {supportedLocales.map((targetLocale) => (
        <Link
          key={targetLocale}
          href={switchLocalePath(pathname, targetLocale, query)}
          hrefLang={targetLocale}
          aria-current={locale === targetLocale ? 'true' : undefined}
          onClick={onChange}
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
            locale === targetLocale ? 'bg-gold text-dark-bg' : 'text-gray-400 hover:text-white'
          }`}
        >
          {labels[targetLocale]}
        </Link>
      ))}
    </div>
  );
}
