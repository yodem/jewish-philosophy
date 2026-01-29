/**
 * Returns favicon URL for use in OG images when content has no image.
 * Edge runtime compatible - uses public URL instead of filesystem.
 */
export async function getFaviconDataUrl(): Promise<string> {
  // Return the public URL to the favicon
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://religousphilosophy.com';
  return `${baseUrl}/favicon.ico`;
}
