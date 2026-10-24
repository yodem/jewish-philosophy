import { David_Libre } from 'next/font/google';

/** The chat's reading face (see DESIGN.md): David, the typeface of Israeli academic print. UI text uses the site's Rubik. */
export const davidLibre = David_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--sc-font-david',
});
