/**
 * contact-email controller
 */

export default {
  async sendContactEmail(ctx) {
    try {
      const { name, email, subject, message, category } = ctx.request.body;

      // Validate required fields
      if (!name || !email || !subject || !message || !category) {
        return ctx.badRequest('Missing required fields');
      }

      // Get the email category to find the prefix
      const emailCategory = await strapi.entityService.findOne(
        'api::email-issue-category.email-issue-category',
        category
      );

      if (!emailCategory) {
        return ctx.badRequest('Invalid category');
      }

      // Create the email subject with prefix
      const emailSubject = `[${emailCategory.prefix}] ${subject} - ${name}`;

      // Create the email body
      const emailBody = `
נושא הפנייה: ${emailCategory.name}
שם השולח: ${name}
אימייל השולח: ${email}

הודעה:
${message}

---
נשלח דרך טופס צרו קשר באתר פילוסופיה יהודית
      `.trim();

      // Send the email using Strapi's email service (Strapi v5 syntax)
      await strapi.plugins.email.services.email.send({
        to: strapi.config.get('plugin::email.settings.supportAddress'), // Support email address
        from: strapi.config.get('plugin::email.settings.defaultFrom'), // Use configured default from
        replyTo: strapi.config.get('plugin::email.settings.defaultFrom'), // User's email for easy reply
        subject: emailSubject,
        text: emailBody,
        html: emailBody.replace(/\n/g, '<br>')
      });

      // Return success response
      ctx.send({
        message: 'Email sent successfully',
        success: true
      });

    } catch (error) {
      console.error('Error sending contact email:', error);
      ctx.internalServerError('Failed to send email');
    }
  }
};
