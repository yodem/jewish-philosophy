import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getGlobalSettings } from "@/data/loaders";
import { Suspense } from 'react';
import { DirectionProvider } from '../components/DirectionProvider';
import ClientThemeProvider from '../components/ClientThemeProvider';
import { Roboto } from 'next/font/google';
import Box from '@mui/material/Box';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const globalSettings = await getGlobalSettings();
  const header = globalSettings?.data?.header || {};
  const footer = globalSettings?.data?.footer || {};
  const copyright = footer?.copyright || '';
  const links = footer?.links || [];

  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <DirectionProvider>
          <ClientThemeProvider>
            <Box sx={{ 
              minHeight: '100vh',
              background: 'linear-gradient(180deg, #fff 0%, #e3f2fd 100%)'
            }}>
            <Navbar header={header} />
              {children}
              <Footer copyright={copyright} links={links} />
              </Box>
          </ClientThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
