import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { secureAuthCookies } from '@/app/api/sadik-chat/_identity';
import { safeRedirect, userIdFromSub } from '@/lib/auth-utils';

/**
 * Google sign-in for the Sadik chat (Auth.js v5), security checklist M3:
 * - Google is the only provider; scope `openid` only (no name, email or picture is requested or kept).
 * - PKCE (S256) and `state` are both on, set explicitly rather than assumed.
 * - JWT sessions, at most 7 days; no database, so no account linking of any kind.
 * - The token keeps one claim, `uid` = sha256(Google `sub`): the identity sent to the bridge. The session object
 *   handed to the browser carries no id at all.
 * - `redirect` accepts same-origin relative paths only.
 * - Cookies are `__Secure-` (session, state, PKCE) / `__Host-` (CSRF) on HTTPS and always on Vercel.
 */

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

/** Built per request (lazy init), so env changes and the HTTPS decision are read at request time. */
export function authConfig(): NextAuthConfig {
  return {
  providers: [
    Google({
      checks: ['pkce', 'state'],
      // Explicit endpoint: building the sign-in URL needs no discovery request.
      authorization: { url: 'https://accounts.google.com/o/oauth2/v2/auth', params: { scope: 'openid', prompt: 'select_account' } },
    }),
  ],
  session: { strategy: 'jwt', maxAge: SESSION_MAX_AGE },
  jwt: { maxAge: SESSION_MAX_AGE },
  useSecureCookies: secureAuthCookies(),
  callbacks: {
    signIn({ account }) {
      return account?.provider === 'google';
    },
    jwt({ token, account, profile }) {
      if (account?.provider === 'google') {
        const sub = profile?.sub ?? token.sub;
        if (!sub) return null;
        return { uid: userIdFromSub(sub) };
      }
      return typeof token.uid === 'string' ? { uid: token.uid } : null;
    },
    session({ session }) {
      // The browser learns only that it is signed in, and until when.
      return { expires: session.expires } as typeof session;
    },
    redirect({ url, baseUrl }) {
      return safeRedirect(url, baseUrl);
    },
  },
  };
}

export const { handlers, auth } = NextAuth(() => authConfig());
