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

      // Resolve email config — try both possible Strapi v5 config paths
      const toAddress =
        strapi.config.get('plugin::email.config.settings.supportAddress') ||
        strapi.config.get('plugin::email.settings.supportAddress') ||
        process.env.RESEND_SUPPORT_TO_EMAIL;
      const fromAddress =
        strapi.config.get('plugin::email.config.settings.defaultFrom') ||
        strapi.config.get('plugin::email.settings.defaultFrom') ||
        process.env.RESEND_DEFAULT_FROM_EMAIL;

      if (!toAddress || !fromAddress) {
        console.error('Email config missing — to:', toAddress, 'from:', fromAddress);
        return ctx.internalServerError('Email configuration is incomplete');
      }

      // Send the email using Strapi's email service
      await strapi.plugins.email.services.email.send({
        to: toAddress,
        from: fromAddress,
        replyTo: fromAddress,
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
