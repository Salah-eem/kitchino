import type { Metadata } from "next";
import { LayoutContent } from "@/components/LayoutContent";
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Toaster } from 'sonner';
import { ConfirmProvider } from '@/hooks/use-confirm';
import { ThemeProvider } from '@/context/ThemeContext';
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Kitchino - Premium Kitchen Equipment",
  description: "Your one-stop shop for premium kitchen equipment and culinary tools",
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();

  return (
    <html lang={locale}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
                document.documentElement.style.colorScheme = theme;
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ConfirmProvider>
              <LayoutContent>
                {children}
              </LayoutContent>
              <Toaster position="top-right" expand={true} richColors />
            </ConfirmProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
