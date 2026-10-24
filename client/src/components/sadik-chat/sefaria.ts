"use client";

/**
 * Sefaria Linker v3 (https://www.sefaria.org/linker.v3.js): turns references such as "משנה תורה, הלכות תשובה ה, א"
 * in a finished answer into Sefaria popups. The script is loaded only while the chat is open; `linkAnswer` is called
 * once per final answer (never per streamed token) and queues the call until the script has loaded. Page text in the
 * linked container is sent to sefaria.org by the linker (stated in the ⓘ info).
 */

export const SEFARIA_LINKER_SRC = 'https://www.sefaria.org/linker.v3.js';

/** Our own controls and source links inside the linked container are never linked. */
export const SEFARIA_EXCLUDE = '.sc-composer, .sc-rail, .sc-head, .sc-src, .sc-link, .sc-pill, .sc-actions, .sc-share, .sc-who, .sc-mark';

export interface SefariaLinkOptions {
  mode: 'popup-click';
  contentLang: 'hebrew';
  interfaceLang: 'hebrew';
  dynamic: true;
  whitelistSelector: string;
  excludeFromLinking: string;
}

type SefariaWindow = Window & { sefaria?: { link?: (opts: SefariaLinkOptions) => void } };

const queue: string[] = [];

function call(selector: string): boolean {
  const w = window as SefariaWindow;
  if (typeof w.sefaria?.link !== 'function') return false;
  try {
    w.sefaria.link({
      mode: 'popup-click',
      contentLang: 'hebrew',
      interfaceLang: 'hebrew',
      dynamic: true,
      whitelistSelector: selector,
      excludeFromLinking: SEFARIA_EXCLUDE,
    });
  } catch {
    // the linker is an enhancement: a failure leaves the plain answer
  }
  return true;
}

/** Links one finished answer (by its container selector), now or once the linker script has loaded. */
export function linkAnswer(selector: string): void {
  if (typeof window === 'undefined') return;
  if (!call(selector) && !queue.includes(selector)) queue.push(selector);
}

/** Called by the Script's onLoad: links the answers that finished before the script arrived. */
export function flushSefariaQueue(): void {
  while (queue.length) {
    const selector = queue.shift()!;
    if (!call(selector)) {
      queue.unshift(selector);
      return;
    }
  }
}
