"use client";

/**
 * SefariaLinker Component
 *
 * Automatically links Jewish text citations on the page to Sefaria.org
 * Uses Sefaria Linker v3 for improved Hebrew/Romanian citation recognition
 *
 * Features:
 * - Popup mode: Click citations to see text content in popup
 * - Bilingual display: Shows both Hebrew and English text
 * - Hebrew interface: RTL support for proper Hebrew display
 * - Debug mode: Shows colored borders around detected citations (dev only)
 *
 * @param options - Custom options to override defaults
 */

import { useRef } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    sefaria?: {
      link: (options?: SefariaLinkOptions) => void;
    };
  }
}

interface SefariaLinkOptions {
  mode?: 'popup-click' | 'link';
  contentLang?: 'bilingual' | 'english' | 'hebrew';
  interfaceLang?: 'english' | 'hebrew';
  excludeFromLinking?: string;
  whitelistSelector?: string;
  dynamic?: boolean;
  popupStyles?: Record<string, string>;
  hidePopupsOnMobile?: boolean;
  versionPreferencesByCorpus?: Record<string, Record<string, string>>;
  debug?: boolean;
}

interface SefariaLinkerProps {
  options?: SefariaLinkOptions;
}

export default function SefariaLinker({
  options = {}
}: SefariaLinkerProps) {
  const initialized = useRef(false);

  // Default options optimized for Hebrew/Romanian content
  const defaultOptions: SefariaLinkOptions = {
    mode: 'popup-click',
    contentLang: 'bilingual', // Show both Hebrew and English
    interfaceLang: 'hebrew',  // Hebrew interface for RTL support
    hidePopupsOnMobile: false, // Enable popups on mobile for better UX
    dynamic: false, // Content is static on these pages
    debug: false, // No debug borders, just clean underlines
    ...options
  };

  const handleScriptLoad = () => {
    console.log('Sefaria Linker script loaded successfully');

    // Add custom CSS for Sefaria citations
    const style = document.createElement('style');
    style.textContent = `
      /* Sefaria Linker citation styling - just underline */
      .sefaria-citation,
      a[sefaria-citation] {
        text-decoration: underline !important;
        text-decoration-thickness: 1px !important;
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);

    // Initialize linker after script loads
    if (window.sefaria && !initialized.current) {
      try {
        window.sefaria.link(defaultOptions);
        initialized.current = true;
        console.log('Sefaria Linker initialized successfully with options:', defaultOptions);
        console.log('Sefaria Linker initialized - citations will have clean underlines');
      } catch (error) {
        console.error('Failed to initialize Sefaria Linker:', error);
      }
    }
  };

  const handleScriptError = () => {
    console.error('Failed to load Sefaria Linker script');
  };

  // Use Next.js Script component for better loading handling
  return (
    <Script
      src="https://www.sefaria.org/linker.v3.js"
      charSet="utf-8"
      onLoad={handleScriptLoad}
      onError={handleScriptError}
      strategy="afterInteractive"
    />
  );
}
