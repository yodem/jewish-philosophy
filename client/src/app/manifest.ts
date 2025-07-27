import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'פילוסופיה יהודית - לימוד פילוסופיה יהודית מקוונת',
    short_name: 'פילוסופיה יהודית',
    description: 'פלטפורמה מובילה ללימוד פילוסופיה יהודית מקוונת - שיעורי וידאו, הרמב״ם, הלכה ואגדה עם שלום צדיק. תכנים איכותיים בפילוסופיה דתית, יהדות רציונלית, ביקורת החילון.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    lang: 'he',
    dir: 'rtl',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['education', 'books', 'lifestyle', 'learning'],
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'סדרות שיעורים',
        short_name: 'סדרות',
        description: 'גישה לכל סדרות השיעורים בפילוסופיה יהודית',
        url: '/playlists',
        icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'כתבים',
        short_name: 'כתבים',
        description: 'מאמרים וכתבים בפילוסופיה יהודית',
        url: '/writings',
        icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'שאלות ותשובות',
        short_name: 'רספונסא',
        description: 'שאלות ותשובות בנושאי פילוסופיה יהודית',
        url: '/responsa',
        icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'חיפוש',
        short_name: 'חיפוש',
        description: 'חיפוש תכנים באתר',
        url: '/search',
        icons: [{ src: '/favicon-96x96.png', sizes: '96x96' }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    // PWA features
    display_override: ['window-controls-overlay', 'standalone'],
    // For better mobile experience
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Jewish Philosophy Platform - Desktop View',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Jewish Philosophy Platform - Mobile View',
      },
    ],
  };
} 