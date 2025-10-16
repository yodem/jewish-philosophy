import { factories } from '@strapi/strapi';
 
export default factories.createCoreController('api::video.video', ({ strapi }) => ({
  async updateViewCount(ctx) {
    try {
      const { id } = ctx.params;
      const video = await strapi.db.query("api::video.video").findOne({
        where: { id },
        select: ["views"],  
      });

      if (!video) {
        return ctx.notFound("Video not found");
      }
      
      const updatedVideo = await strapi.db.query("api::video.video").update({
        where: { id },
        data: {
          views: (video.views || 0) + 1,
        },
      });

      return ctx.send({ message: "View count updated", data: updatedVideo });
    } catch (error) {
      console.error("Error updating view count:", error);
      return ctx.badRequest("Failed to update view count");
    }
  },
})); 