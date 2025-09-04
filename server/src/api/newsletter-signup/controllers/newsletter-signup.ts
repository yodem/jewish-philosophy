/**
 * newsletter-signup controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::newsletter-signup.newsletter-signup', ({ strapi }) => ({
  async create(ctx) {
    try {
      // Call the default create method first
      const response = await super.create(ctx);

      // Get the email from the created subscription
      const email = response.data.email;

      if (email) {
        // Send styled confirmation email to the subscriber
        await strapi.service("api::email.email").sendStyledEmail({
          to: email,
          subject: 'ברוכים הבאים לניוזלטר הפילוסופיה היהודית! 🎉',
          template: 'welcomeNewsletter',
          data: {
            subscriberCount: '1,000+',
            siteUrl: process.env.FRONTEND_URL || 'https://jewish-philosophy.vercel.app/',
            plainText: `ברוכים הבאים לניוזלטר הפילוסופיה היהודית! תודה שהצטרפתם לקהילה שלנו. מעתה תקבלו עדכונים על מאמרים חדשים, שיעורים, תשובות לשאלות ועוד. בקרו באתר: ${process.env.FRONTEND_URL || 'https://jewish-philosophy.vercel.app/'}`
          }
        });

        console.log(`Welcome email sent to ${email}`);
      }

      return response;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // If it's an email-only error, still return success for the subscription
      // but if it's a validation error, let it bubble up
      if (error.name === 'ValidationError' || error.status === 400) {
        throw error;
      }
      
      // For email errors, we'll still return success but log the error
      return super.create(ctx);
    }
  }
}));
