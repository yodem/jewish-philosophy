import { Noto_Rashi_Hebrew, Noto_Serif_Hebrew } from 'next/font/google';

/**
 * The chat's two faces (see DESIGN.md): square Hebrew serif for the main text and the interface, Rashi script for
 * the commentary (quotations, previews), as on a printed page with commentary.
 */
export const notoSerifHebrew = Noto_Serif_Hebrew({
  subsets: ['hebrew', 'latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--sc-font-serif',
});

export const notoRashiHebrew = Noto_Rashi_Hebrew({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--sc-font-rashi',
});

export const chatFontClasses = `${notoSerifHebrew.variable} ${notoRashiHebrew.variable}`;
