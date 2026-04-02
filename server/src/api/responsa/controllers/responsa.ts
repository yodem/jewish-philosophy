/**
 * responsa controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::responsa.responsa', ({ strapi }) => ({
  async create(ctx) {
    console.log('📥 Responsa create called');
    console.log('  Query params:', JSON.stringify(ctx.query));
    console.log('  Body data keys:', Object.keys(ctx.request.body?.data || {}));

    // Auto-publish user-submitted questions so they appear on the site immediately
    if (!ctx.query.status) {
      console.log('  No status in query — setting to published');
      ctx.query.status = 'published';
    }

    // Call the default create method first
    const response = await super.create(ctx);

    console.log('✅ Responsa created:', JSON.stringify({
      id: response.data?.id,
      documentId: response.data?.documentId,
      title: response.data?.title,
      slug: response.data?.slug,
      publishedAt: response.data?.publishedAt,
    }));

    try {
      // Get the created responsa with its data
      const responsa = response.data;

      if (responsa?.questioneerEmail && responsa?.questioneerEmail.trim() && responsa?.title) {
        const questionLink = `${process.env.FRONTEND_URL || 'https://religousphilosophy.com/'}/responsa/${responsa.slug}`;

        // Send confirmation email to the questioneer
        await strapi.service("api::email.email").sendStyledEmail({
          to: responsa.questioneerEmail,
          subject: `השאלה שלכם התקבלה: ${responsa.title}`,
          template: 'questionConfirmation',
          data: {
            questioneer: responsa.questioneer,
            questionTitle: responsa.title,
            questionLink,
            plainText: `שלום ${responsa.questioneer}, השאלה שלכם "${responsa.title}" התקבלה בהצלחה! ניתן לצפות בה בקישור הבא: ${questionLink}`
          }
        });

        console.log(`Question confirmation email sent to ${responsa.questioneerEmail} for responsa: ${responsa.title}`);
      }
    } catch (error) {
      console.error('Failed to send question confirmation email:', error);
      // Don't fail the question creation if email fails
    }

    return response;
  },

  async updateViewCount(ctx) {
    try {
      const { id } = ctx.params;
      const responsa = await strapi.db.query("api::responsa.responsa").findOne({
        where: { id },
        select: ["views"],  
      });

      if (!responsa) {
        return ctx.notFound("Responsa not found");
      }
      
      const updatedResponsa = await strapi.db.query("api::responsa.responsa").update({
        where: { id },
        data: {
          views: (responsa.views || 0) + 1,
        },
      });

      return ctx.send({ message: "View count updated", data: updatedResponsa });
    } catch (error) {
      console.error("Error updating view count:", error);
      return ctx.badRequest("Failed to update view count");
    }
  },
})); 