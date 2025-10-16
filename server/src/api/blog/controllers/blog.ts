/**
 * blog controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog.blog', ({ strapi }) => ({
  async updateViewCount(ctx) {
    try {
      const { id } = ctx.params;
      const blog = await strapi.db.query("api::blog.blog").findOne({
        where: { id },
        select: ["views"],  
      });

      if (!blog) {
        return ctx.notFound("Blog not found");
      }
      
      const updatedBlog = await strapi.db.query("api::blog.blog").update({
        where: { id },
        data: {
          views: (blog.views || 0) + 1,
        },
      });

      return ctx.send({ message: "View count updated", data: updatedBlog });
    } catch (error) {
      console.error("Error updating view count:", error);
      return ctx.badRequest("Failed to update view count");
    }
  },
})); 