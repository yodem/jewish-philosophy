import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGlobalSettings } from "@/data/loaders";
import { Suspense } from 'react';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const globalRes = await getGlobalSettings();
  const footer = globalRes?.data?.footer;
  const links = footer?.links?.map((l: any) => ({ label: l.label, url: l.url })) || [];
  const copyright = footer?.copyright || '';
  const header = globalRes?.data?.header;

  return (
    <html lang="en">
      <body className="min-h-scren bg-gradient-to-br from-blue-100 via-blue-200 to-white">
        <Suspense fallback={<nav className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow-md"><div className="animate-pulse h-8 w-32 bg-gray-700 rounded" /></nav>}>
          <Navbar header={header} />
        </Suspense>
        <main>
          {children}
        </main>
        <Footer copyright={copyright} links={links} />
      </body>
    </html>
  );
}
