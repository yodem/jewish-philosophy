import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGlobalSettings } from "@/data/loaders";
import { Suspense } from 'react';
import ClientThemeProvider from '../components/ClientThemeProvider';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const globalRes = await getGlobalSettings();
  const footer = globalRes?.data?.footer;
  const links = footer?.links?.map((l: any) => ({ label: l.label, url: l.url })) || [];
  const copyright = footer?.copyright || '';
  const header = globalRes?.data?.header;

  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ClientThemeProvider>
            <Suspense fallback={null}>
              <Navbar header={header} />
            </Suspense>
            {children}
            <Footer copyright={copyright} links={links} />
          </ClientThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
