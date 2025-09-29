/**
 * newsletter-signup router
 */

export default {
  routes: [
    // GET /api/newsletter-signups
    {
      method: 'GET',
      path: '/newsletter-signups',
      handler: 'newsletter-signup.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // GET /api/newsletter-signups/:id
    {
      method: 'GET',
      path: '/newsletter-signups/:id',
      handler: 'newsletter-signup.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // POST /api/newsletter-signups
    {
      method: 'POST',
      path: '/newsletter-signups',
      handler: 'newsletter-signup.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // PUT /api/newsletter-signups/:id
    {
      method: 'PUT',
      path: '/newsletter-signups/:id',
      handler: 'newsletter-signup.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // DELETE /api/newsletter-signups/:id
    {
      method: 'DELETE',
      path: '/newsletter-signups/:id',
      handler: 'newsletter-signup.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // Custom unsubscribe route
    {
      method: 'DELETE',
      path: '/newsletter-signups/unsubscribe',
      handler: 'newsletter-signup.unsubscribe',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
