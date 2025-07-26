import './globals.css';
import Navbar from '../components/Navbar';
import { getGlobalSettings } from "@/data/loaders";
import { Suspense } from 'react';
import { Card } from "@/components/ui/card";
import Providers from './providers';
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from "@vercel/analytics/next"
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'פילוסופיה יהודית | לימוד פילוסופיה יהודית מקוונת',
    template: '%s | פילוסופיה יהודית',
  },
  description: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורים, ספרים, מאמרים ושאלות ותשובות. גלו תכנים איכותיים בהלכה, אגדה, פילוסופיה יהודית ועוד.',
  keywords: ['פילוסופיה יהודית', 'פילוסופיה דתית', 'הרמב"ם', 'בחירה חופשית', 'ידיעת האל', 'השגחה', 'טעמי המצוות', 'מוסר הרמב"ם', 'דרך האמצע', 'נבל ברשות התורה', 'הוכחה לקיום האל', 'מהות האל', 'הכרחי המציאות', 'טרנסצנדנטיות האל', 'ביקורת החילון', 'יהדות רציונלית', 'דטרמיניזם', 'הגלגלים בפילוסופיה', 'מושגים בפילוסופיה יהודית', 'מבוא לפילוסופיה יהודית', 'על-טבעי ביהדות', 'חילון ליברלי', 'קיום מצוות', 'רוח החוק', 'סכלים נבדלים', 'אמת מהותית', 'השגה שכלית', 'תורה מן השמיים', 'הגדרת דת', 'הגדרת פילוסופיה', 'פילוסופיה דתית מתונה', 'פילוסופיה דתית רדיקלית', 'ספקות דתיות', 'אחדות האל', 'שכר ועונש', 'רבי יהודה הלוי', 'רבי סעדיה גאון', 'אריסטו', 'אבן רושד', 'מורה נבוכים', 'משנה תורה', 'שמונה פרקים', 'הלכות יסודי התורה', 'הלכות דעות', 'כוזרי', 'שלום צדיק', 'סדרות שיעורים', 'שיעורי וידאו', 'קורסים יהודיים', 'לימוד ברצף'],
  authors: [{ name: 'שלום צדיק' }],
  creator: 'שלום צדיק',
  publisher: 'שלום צדיק, יותם פרום',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://jewish-philosophy.vercel.app/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'פילוסופיה יהודית | לימוד פילוסופיה יהודית מקוונת',
    description: 'פלטפורמה מובילה ללימוד יהודי מקוון - שיעורים, ספרים, מאמרים ושאלות ותשובות. גלו תכנים איכותיים בהלכה, אגדה, פילוסופיה יהודית ועוד.',
    url: '/',
    siteName: 'פילוסופיה יהודית',
    locale: 'he_IL',
    type: 'website',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'פילוסופיה יהודית - פלטפורמה ללימוד פילוסופיה יהודית מקוונת',
      },
    ],
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
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const globalRes = await getGlobalSettings();
  const header = globalRes?.data?.header;

  return (
    <html lang="hebrew" dir="rtl" className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-white flex flex-col overflow-x-hidden">
        <Providers>
          <Suspense fallback={<nav className="w-full bg-gray-900 text-white py-4 px-8 flex items-center justify-between shadow-md"><div className="animate-pulse h-8 w-32 bg-gray-700 rounded" /></nav>}>
            <Navbar header={header} />
          </Suspense>

          <div className="container mx-auto px-1 sm:px-4 py-4 sm:py-8 flex flex-col align-center">
            <Card className="p-2 sm:p-6 bg-white/95 shadow-lg border-0 flex flex-col items-center overflow-hidden">
              {children}
            </Card>
          </div>
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-72NSRCMH08" />
      <Analytics />
    </html>
  );
}
