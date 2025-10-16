/**
 * writing controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::writing.writing', ({ strapi }) => ({
  async updateViewCount(ctx) {
    try {
      const { id } = ctx.params;
      const writing = await strapi.db.query("api::writing.writing").findOne({
        where: { id },
        select: ["views"],  
      });

      if (!writing) {
        return ctx.notFound("Writing not found");
      }
      
      const updatedWriting = await strapi.db.query("api::writing.writing").update({
        where: { id },
        data: {
          views: (writing.views || 0) + 1,
        },
      });

      return ctx.send({ message: "View count updated", data: updatedWriting });
    } catch (error) {
      console.error("Error updating view count:", error);
      return ctx.badRequest("Failed to update view count");
    }
  },
}));
