/**
 * responsa controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::responsa.responsa', ({ strapi }) => ({
  async create(ctx) {
    // Call the default create method first
    const response = await super.create(ctx);

    try {
      // Get the created responsa with its data
      const responsa = response.data;

      if (responsa?.questioneerEmail && responsa?.title) {
        const questionLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/responsa/${responsa.slug}`;

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
  }
})); 