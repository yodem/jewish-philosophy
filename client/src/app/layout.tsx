import './globals.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGlobalSettings } from "@/data/loaders";
import { Suspense } from 'react';
import { Card } from "@/components/ui/card";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const globalRes = await getGlobalSettings();
  const footer = globalRes?.data?.footer;
  const links = footer?.links?.map((l: any) => ({ label: l.label, url: l.url })) || [];
  const copyright = footer?.copyright || '';
  const header = globalRes?.data?.header;

  return (
    <html lang="hebrew" dir="rtl" className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-white flex flex-col overflow-x-hidden">
        <Suspense fallback={<nav className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow-md"><div className="animate-pulse h-8 w-32 bg-gray-700 rounded" /></nav>}>
          <Navbar header={header} />
        </Suspense>
        <main className="flex-1 flex flex-col w-full">
          <div className="container mx-auto px-1 sm:px-4 py-4 sm:py-8 flex flex-col align-center">
            <Card className="p-2 sm:p-6 bg-white/95 shadow-lg border-0 flex flex-col items-center overflow-hidden">
              {children}
            </Card>
          </div>
        </main>
        <Footer copyright={copyright} links={links} />
      </body>
    </html>
  );
}
