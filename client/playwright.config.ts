import { defineConfig } from '@playwright/test';

/**
 * E2E tests MUST run against local Strapi (localhost:1337).
 * Never run tests against production Strapi to avoid polluting real data.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:4000',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'NEXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337 pnpm start -p 4000',
    port: 4000,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
