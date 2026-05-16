import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Toaster } from 'sonner';
import { ConfirmProvider } from '@/hooks/use-confirm';
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ConfirmProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="top-right" expand={true} richColors />
          </ConfirmProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
