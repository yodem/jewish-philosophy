/**
 * email-issue-category controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::email-issue-category.email-issue-category', ({ strapi }) => ({
  async find(ctx) {
    // Only return active categories, ordered by order field
    const existingFilters = ctx.query.filters && typeof ctx.query.filters === 'object' ? ctx.query.filters : {};
    
    ctx.query = {
      ...ctx.query,
      filters: {
        ...existingFilters,
        isActive: true
      },
      sort: 'order:asc'
    };
    
    const { data, meta } = await super.find(ctx);
    return { data, meta };
  }
}));
