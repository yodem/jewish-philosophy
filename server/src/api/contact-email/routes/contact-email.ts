/**
 * contact-email router
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/contact-email/send',
      handler: 'contact-email.sendContactEmail',
      config: {
        policies: [],
        middlewares: [],
        auth: false // Allow public access
      }
    }
  ]
};
