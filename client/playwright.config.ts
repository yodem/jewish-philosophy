import { defineConfig } from '@playwright/test';
import { E2E_AUTH } from './e2e/fixtures/auth.mjs';

/**
 * E2E tests MUST run against local Strapi (localhost:1337).
 * Never run tests against production Strapi to avoid polluting real data.
 *
 * The Sadik chat bridge is always the local mock (e2e/mock-bridge.mjs): the site server is started with
 * SADIK_BRIDGE_URL pointing at it, so no test can reach the real bridge. E2E_PORT picks the site port (default 4000).
 * A second server on E2E_PORT + 1 has Google sign-in configured with throwaway values (e2e/fixtures/auth.mjs) for
 * sadik-auth.spec.ts; the first one has no AUTH_* at all, which is how the chat must also work.
 */
const PORT = Number(process.env.E2E_PORT || 4000);
const AUTH_PORT = PORT + 1;
const BRIDGE_PORT = Number(process.env.MOCK_BRIDGE_PORT || PORT + 10);
const SITE_ENV = `SADIK_TRUST_PROXY=1 SADIK_BRIDGE_URL=http://127.0.0.1:${BRIDGE_PORT} SADIK_BRIDGE_TOKEN=e2e-bridge-token NEXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337`;
const AUTH_ENV = `AUTH_TRUST_HOST=true AUTH_SECRET=${E2E_AUTH.AUTH_SECRET} AUTH_GOOGLE_ID=${E2E_AUTH.AUTH_GOOGLE_ID} AUTH_GOOGLE_SECRET=${E2E_AUTH.AUTH_GOOGLE_SECRET}`;
process.env.E2E_AUTH_BASE_URL = `http://localhost:${AUTH_PORT}`;
process.env.E2E_BRIDGE_URL = `http://127.0.0.1:${BRIDGE_PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `MOCK_BRIDGE_PORT=${BRIDGE_PORT} node e2e/mock-bridge.mjs`,
      port: BRIDGE_PORT,
      reuseExistingServer: false,
      timeout: 10000,
    },
    {
      command: `${SITE_ENV} pnpm start -p ${PORT}`,
      port: PORT,
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command: `${SITE_ENV} ${AUTH_ENV} pnpm start -p ${AUTH_PORT}`,
      port: AUTH_PORT,
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
});
