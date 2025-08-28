/**
 * comment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    console.log('🚀 Comment controller create method called');
    console.log('Request body:', ctx.request.body);
    
    try {
      const { answer, answerer, responsaSlug } = ctx.request.body.data;
      
      if (!responsaSlug) {
        return ctx.badRequest('responsaSlug is required');
      }

      console.log('🔍 Finding responsa by slug:', responsaSlug);
      
      // Find the responsa by slug first
      const responsa = await strapi.entityService.findMany('api::responsa.responsa', {
        filters: { slug: responsaSlug },
        fields: ['id', 'title', 'slug', 'questioneer', 'questioneerEmail']
      }) as any[];

      if (!responsa || responsa.length === 0) {
        console.log('❌ Responsa not found for slug:', responsaSlug);
        return ctx.notFound('Responsa not found');
      }

      const responsaData = responsa[0];
      console.log('✅ Found responsa:', responsaData);

      // Create the comment with the responsa ID
      const commentData = {
        answer,
        answerer,
        responsa: responsaData.id,
        publishedAt: new Date().toISOString()
      };

      console.log('📝 Creating comment with data:', commentData);
      
      const comment = await strapi.entityService.create('api::comment.comment', {
        data: commentData,
        populate: {
          responsa: {
            fields: ['title', 'slug', 'questioneer', 'questioneerEmail']
          }
        }
      });

      console.log('✅ Comment created successfully:', comment);

      // Send email notification
      if (responsaData?.questioneerEmail) {
        const questionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/responsa/${responsaData.slug}`;

        console.log('📬 Sending email notification to:', responsaData.questioneerEmail);
        console.log('Question title:', responsaData.title);
        console.log('Question link:', questionLink);

        try {
          await strapi.service("api::email.email").sendStyledEmail({
            to: responsaData.questioneerEmail,
            subject: `תשובה לשאלה שלך: ${responsaData.title}`,
            template: 'questionResponse',
            data: {
              questioneer: responsaData.questioneer,
              questionTitle: responsaData.title,
              questionLink,
              plainText: `שלום ${responsaData.questioneer}, קיבלת תשובה לשאלה שלך: "${responsaData.title}". ניתן לראות את התשובה המלאה בקישור הבא: ${questionLink}`
            }
          });

          console.log(`✅ Email notification sent successfully to ${responsaData.questioneerEmail}`);
        } catch (emailError) {
          console.error('❌ Failed to send email notification:', emailError);
          // Don't fail the comment creation if email fails
        }
      } else {
        console.log('❌ No questioneer email found in responsa data');
      }

      return { data: comment };
    } catch (error) {
      console.error('❌ Error creating comment:', error);
      throw error;
    }
  }
})); 