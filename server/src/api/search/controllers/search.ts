/**
 * A set of functions called "actions" for `search`
 */

export default {
  search: async (ctx) => {
    try {
      const { query, contentTypes, categories } = ctx.query;

      // Validate that at least one search parameter is provided
      if (!query && !categories) {
        ctx.status = 400;
        ctx.body = {
          error: 'At least one search parameter (query or categories) is required'
        };
        return;
      }

      // Call the search service
      const results = await strapi.service('api::search.search').performSearch({
        query,
        contentTypes,
        categories
      });

      ctx.body = {
        data: results,
        meta: {
          query,
          contentTypes,
          categories,
          limit: 20,
          offset: 0,
          total: results.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (err) {
      ctx.status = 500;
      ctx.body = {
        error: 'An error occurred while performing search',
        details: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
};
