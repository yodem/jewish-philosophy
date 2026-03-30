import './globals.css';
import LayoutShell from './LayoutShell';
import { Suspense } from 'react';

import Providers from './providers';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from 'next';
import { JsonLd, Schema } from '@/lib/json-ld';
import LayoutClient from './LayoutClient';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { rubik } from '@/lib/fonts';

export const metadata: Metadata = {
  title: {
    default: 'בית | שלום צדיק - פילוסופיה דתית',
    template: '%s | שלום צדיק - פילוסופיה דתית',
  },
  description: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורי וידאו, ספרים, מאמרים ושאלות ותשובות בפילוסופיה דתית. לימוד הרמב"ם,, אגדה, מוסר יהודי עם שלום צדיק. תכנים איכותיים בפילוסופיה דתית, יהדות רציונלית, ביקורת החילון.',
  keywords: ['פילוסופיה דתית', 'פילוסופיה דתית', 'הרמב"ם', 'בחירה חופשית', 'ידיעת האל', 'השגחה', 'טעמי המצוות', 'מוסר הרמב"ם', 'דרך האמצע', 'נבל ברשות התורה', 'הוכחה לקיום האל', 'מהות האל', 'הכרחי המציאות', 'טרנסצנדנטיות האל', 'ביקורת החילון', 'יהדות רציונלית', 'דטרמיניזם', 'הגלגלים בפילוסופיה', 'מושגים בפילוסופיה דתית', 'מבוא לפילוסופיה דתית', 'על-טבעי ביהדות', 'חילון ליברלי', 'קיום מצוות', 'רוח החוק', 'סכלים נבדלים', 'אמת מהותית', 'השגה שכלית', 'תורה מן השמיים', 'הגדרת דת', 'הגדרת פילוסופיה', 'פילוסופיה דתית מתונה', 'פילוסופיה דתית רדיקלית', 'ספקות דתיות', 'אחדות האל', 'שכר ועונש', 'רבי יהודה הלוי', 'רבי סעדיה גאון', 'אריסטו', 'אבן רושד', 'מורה נבוכים', 'משנה תורה', 'שמונה פרקים', 'הלכות יסודי התורה', 'הלכות דעות', 'כוזרי', 'שלום צדיק', 'סדרות שיעורים', 'שיעורי וידאו', 'קורסים יהודיים', 'לימוד ברצף', 'הלכה', 'אגדה', 'מוסר יהודי', 'מחשבה יהודית', 'פלטפורמה יהודית', 'לימוד מקוון'],
  authors: [{ name: 'שלום צדיק' }],
  creator: 'שלום צדיק',
  publisher: 'שלום צדיק, יותם פרום',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'בית | שלום צדיק - פילוסופיה דתית',
    description: 'פלטפורמה מקוונת ללימוד פילוסופיה דתית',
    url: '/',
    siteName: 'פילוסופיה דתית',
    locale: 'he_IL',
    type: 'website',
    images: [],
  },
  twitter: {
    card: 'summary',
    title: 'בית | שלום צדיק - פילוסופיה דתית',
    description: 'פלטפורמה מקוונת ללימוד פילוסופיה דתית',
    creator: '@jewish_philosophy',
    site: '@jewish_philosophy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'theme-color': '#1e3a8a',
    'msapplication-TileColor': '#1e3a8a',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'google-site-verification': 'Zq_s80KKBqFbAgDBh_VH4Ju2-viBuEf24eEZMC26BIs'
  },
  verification: {
    google: 'Zq_s80KKBqFbAgDBh_VH4Ju2-viBuEf24eEZMC26BIs',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com/';
  const logoUrl = `${siteUrl}logo.png`;

  const organizationSchema: Schema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'פילוסופיה דתית',
    alternateName: 'Jewish Philosophy Platform',
    url: siteUrl,
    logo: logoUrl,
    description: 'פלטפורמה מובילה ללימוד פילוסופיה דתית מקוונת',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'שלום צדיק',
    },
    sameAs: [
      'https://www.facebook.com/jewish.philosophy',
      'https://www.youtube.com/c/jewish-philosophy',
      'https://www.instagram.com/jewish_philosophy',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Hebrew',
    },
  };

  const websiteSchema: Schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'פילוסופיה דתית',
    url: siteUrl,
    description: 'פלטפורמה מובילה ללימוד פילוסופיה דתית מקוונת',
    inLanguage: 'he-IL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}search?q={search_term_string}`,
      },
    },
  };

  const siteNavSchema: Schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ניווט האתר',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'בית', url: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'בלוג', url: `${siteUrl}blog` },
      { '@type': 'ListItem', position: 3, name: 'סדרות', url: `${siteUrl}playlists` },
      { '@type': 'ListItem', position: 4, name: 'שו"ת', url: `${siteUrl}responsa` },
      { '@type': 'ListItem', position: 5, name: 'כתבים', url: `${siteUrl}writings` },
      { '@type': 'ListItem', position: 6, name: 'מושגים', url: `${siteUrl}terms` },
      { '@type': 'ListItem', position: 7, name: 'אודות', url: `${siteUrl}about` },
      { '@type': 'ListItem', position: 8, name: 'צור קשר', url: `${siteUrl}contact` },
      { '@type': 'ListItem', position: 9, name: 'חיפוש', url: `${siteUrl}search` },
    ],
  };

  return (
    <html lang="he" dir="rtl" className={rubik.className} suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply dark class before first paint to prevent theme flicker */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s!=='light'&&d)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />

        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <JsonLd data={siteNavSchema} />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="googlebot" content="index,follow,max-video-preview:-1,max-image-preview:large,max-snippet:-1" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href={`${process.env.NEXT_PUBLIC_STRAPI_BASE_URL?.replace('strapiapp.com', 'media.strapiapp.com') || ''}`} />
        <link rel="dns-prefetch" href="//www.youtube.com" />
        <link rel="dns-prefetch" href="//i.ytimg.com" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N78GTSCR"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <Providers>
          <Suspense fallback={
            <>
              <nav className="w-full bg-navbar text-navbar-foreground py-3 px-3 sm:py-4 sm:px-8 flex items-center justify-between shadow-lg border-b border-white/10 sticky top-0 z-50">
                <div className="animate-pulse h-8 w-32 bg-white/20 rounded" />
              </nav>
              <main className="flex-1 flex flex-col w-full">
                {children}
              </main>
            </>
          }>
            <LayoutShell>
              {children}
            </LayoutShell>
          </Suspense>

          <LayoutClient />
        </Providers>

        <GoogleAnalytics gaId="G-72NSRCMH08" />
        <GoogleTagManager gtmId="GTM-N78GTSCR" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
