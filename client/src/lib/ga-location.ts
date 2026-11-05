/**
 * GA4 must never receive a shared-answer id or a Vercel share token. This inline script runs in <head>, before the
 * GA config command, and sets a sanitised `page_location` / `page_referrer`: `/sadik/share/<id>` becomes
 * `/sadik/share/_`, and the `_vercel_share` query parameter and the hash are removed.
 * Keep `sanitizeGaUrl` and the script's `s()` identical (an e2e test checks the script's output on a share page).
 */
export function sanitizeGaUrl(href: string): string {
  try {
    const url = new URL(href);
    url.searchParams.delete('_vercel_share');
    url.pathname = url.pathname.replace(/^\/sadik\/share\/[^/]+/, '/sadik/share/_');
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export const GA_LOCATION_SCRIPT = `(function(){try{
function s(u){try{var x=new URL(u);x.searchParams.delete('_vercel_share');x.pathname=x.pathname.replace(/^\\/sadik\\/share\\/[^/]+/,'/sadik/share/_');x.hash='';return x.toString()}catch(e){return ''}}
window.dataLayer=window.dataLayer||[];
function g(){window.dataLayer.push(arguments)}
var p={page_location:s(location.href)};
if(document.referrer){p.page_referrer=s(document.referrer)}
g('set',p);
}catch(e){}})()`;
