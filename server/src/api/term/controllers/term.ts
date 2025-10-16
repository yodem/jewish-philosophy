/**
 * term controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::term.term', ({ strapi }) => ({
  async updateViewCount(ctx) {
    try {
      const { id } = ctx.params;
      const term = await strapi.db.query("api::term.term").findOne({
        where: { id },
        select: ["views"],  
      });

      if (!term) {
        return ctx.notFound("Term not found");
      }
      
      const updatedTerm = await strapi.db.query("api::term.term").update({
        where: { id },
        data: {
          views: (term.views || 0) + 1,
        },
      });

      return ctx.send({ message: "View count updated", data: updatedTerm });
    } catch (error) {
      console.error("Error updating view count:", error);
      return ctx.badRequest("Failed to update view count");
    }
  },
}));
