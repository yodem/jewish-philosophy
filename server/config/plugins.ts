export default ({ env }: { env: (key: string) => string }) => ({
  // Official Strapi SEO Plugin Configuration
  // Reference: https://strapi.io/blog/strapi-seo-plugins
  seo: {
    enabled: true,
  },
  // Email configuration for Resend
  email: {
    config: {
      provider: 'strapi-provider-email-resend-strapi',
      providerOptions: {
        apiKey: env('RESEND_API_KEY'),
      },
      settings: {
        defaultFrom: env('RESEND_DEFAULT_FROM_EMAIL') || 'onboarding@resend.dev',
        defaultReplyTo: env('RESEND_DEFAULT_REPLY_TO_EMAIL') || 'onboarding@resend.dev',
        testAddress: env('RESEND_TEST_ADDRESS') || 'onboarding@resend.dev',
      },
    },
  },
});
