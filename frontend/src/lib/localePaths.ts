export const supportedLocales = ['en', 'fr'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

export function localizedPath(locale: string, path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalizedPath === '/' ? '' : normalizedPath}`;
}

export function switchLocalePath(pathname: string, targetLocale: string, query = '') {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length > 0 && isSupportedLocale(segments[0])) {
    segments[0] = targetLocale;
  } else {
    segments.unshift(targetLocale);
  }

  const path = `/${segments.join('/')}`;
  return query ? `${path}?${query}` : path;
}
