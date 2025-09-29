/**
 * newsletter-signup controller
 */

import { factories } from '@strapi/strapi'
import resendAudienceService from '../../../services/resend-audience'

export default factories.createCoreController('api::newsletter-signup.newsletter-signup', ({ strapi }) => ({
  // Extend default CRUD methods
  async find(ctx) {
    return await super.find(ctx);
  },

  async findOne(ctx) {
    return await super.findOne(ctx);
  },

  async update(ctx) {
    return await super.update(ctx);
  },

  async delete(ctx) {
    return await super.delete(ctx);
  },
  async create(ctx) {
    try {
      // Call the default create method first
      const response = await super.create(ctx);

      // Get the email from the created subscription
      const email = response.data.email;

      if (email) {
        // Add to Resend audience (non-blocking)
        try {
          const audienceResult = await resendAudienceService.addContact(email);
          if (audienceResult.success) {
            console.log(`✅ Added ${email} to Resend audience`);
          } else {
            console.warn(`⚠️ Failed to add ${email} to Resend audience: ${audienceResult.error}`);
          }
        } catch (audienceError) {
          // Log but don't fail the subscription
          console.error('Resend audience error (non-critical):', audienceError);
        }

        // Send styled confirmation email to the subscriber
        await strapi.service("api::email.email").sendStyledEmail({
          to: email,
          subject: 'ברוכים הבאים לניוזלטר הפילוסופיה היהודית! 🎉',
          template: 'welcomeNewsletter',
          data: {
            subscriberCount: '1,000+',
            siteUrl: process.env.FRONTEND_URL || 'https://jewish-philosophy.vercel.app/',
            unsubscribeUrl: `${process.env.FRONTEND_URL || 'https://jewish-philosophy.vercel.app/'}/unsubscribe`,
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
  },

  async unsubscribe(ctx) {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        return ctx.badRequest('Email is required');
      }

      // Find the newsletter signup by email
      const entries = await strapi.entityService.findMany('api::newsletter-signup.newsletter-signup', {
        filters: {
          email: {
            $eq: email
          }
        }
      });

      if (!entries || entries.length === 0) {
        return ctx.notFound('Email not found in newsletter subscriptions');
      }

      // Remove from Resend audience (non-blocking)
      try {
        const audienceResult = await resendAudienceService.removeContact(email);
        if (audienceResult.success) {
          console.log(`✅ Removed ${email} from Resend audience`);
        } else {
          console.warn(`⚠️ Failed to remove ${email} from Resend audience: ${audienceResult.error}`);
        }
      } catch (audienceError) {
        // Log but don't fail the unsubscription
        console.error('Resend audience removal error (non-critical):', audienceError);
      }

      // Delete the subscription
      await strapi.entityService.delete('api::newsletter-signup.newsletter-signup', entries[0].id);

      return {
        data: {
          message: 'Successfully unsubscribed from newsletter'
        }
      };
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return ctx.internalServerError('Failed to unsubscribe');
    }
  }
}));
