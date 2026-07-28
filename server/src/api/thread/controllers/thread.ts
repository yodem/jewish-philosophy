/**
 * thread controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::thread.thread', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { answer, answerer, parentCommentSlug, responsaSlug, blogSlug } = ctx.request.body.data;

      // Validate required fields
      if (!parentCommentSlug) {
        return ctx.badRequest('parentCommentSlug is required');
      }

      if (!responsaSlug && !blogSlug) {
        return ctx.badRequest('Either responsaSlug or blogSlug is required');
      }

      if (responsaSlug && blogSlug) {
        return ctx.badRequest('Cannot specify both responsaSlug and blogSlug');
      }

      // Guard against double-submission: if an identical thread was created in the
      // last 10 seconds, return it instead of inserting a duplicate.
      const tenSecondsAgo = new Date(Date.now() - 10000);
      const existingThreads = await strapi.entityService.findMany('api::thread.thread', {
        filters: {
          parentCommentSlug,
          answerer,
          answer,
          createdAt: { $gt: tenSecondsAgo },
        },
      }) as any[];

      if (existingThreads && existingThreads.length > 0) {
        return { data: existingThreads[0] };
      }

      // Generate slug from answerer
      const timestamp = Date.now();
      let slug = answerer
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      // If slug is empty or very short (likely because of Hebrew chars), use a timestamp prefix
      if (slug.length < 3) {
        slug = `thread-${timestamp}`;
      } else {
        // Otherwise, append timestamp to ensure uniqueness
        slug = `${slug}-${timestamp}`;
      }

      // Find the parent comment by slug
      const parentComment = await strapi.entityService.findMany('api::comment.comment', {
        filters: { slug: parentCommentSlug },
        fields: ['id', 'answerer', 'slug']
      }) as any[];

      if (!parentComment || parentComment.length === 0) {
        return ctx.notFound('Parent comment not found');
      }

      let threadData: {
        answer: any;
        answerer: any;
        slug: string;
        parentComment: number;
        publishedAt: string;
        responsa?: number;
        blog?: number;
        responsaSlug?: string;
        blogSlug?: string;
        parentCommentSlug: string;
      } = {
        answer,
        answerer,
        slug,
        parentComment: parentComment[0].id,
        parentCommentSlug,
        publishedAt: new Date().toISOString()
      };

      let contentData = null;

      if (responsaSlug) {
        // Find the responsa by slug
        const responsa = await strapi.entityService.findMany('api::responsa.responsa', {
          filters: { slug: responsaSlug },
          fields: ['id', 'title', 'slug', 'questioneer', 'questioneerEmail']
        }) as any[];

        if (!responsa || responsa.length === 0) {
          return ctx.notFound('Responsa not found');
        }

        contentData = responsa[0];
        threadData = { ...threadData, responsa: contentData.id, responsaSlug };
      } else if (blogSlug) {
        // Find the blog by slug
        const blog = await strapi.entityService.findMany('api::blog.blog', {
          filters: { slug: blogSlug },
          fields: ['id', 'title', 'slug'],
          populate: {
            author: {
              fields: ['name', 'email']
            }
          }
        }) as any[];

        if (!blog || blog.length === 0) {
          return ctx.notFound('Blog not found');
        }

        contentData = blog[0];
        threadData = { ...threadData, blog: contentData.id, blogSlug };
      }

      const thread = await strapi.entityService.create('api::thread.thread', {
        data: threadData,
        populate: {
          parentComment: {
            fields: ['answerer', 'slug']
          }
        }
      });

      return { data: thread };
    } catch (error) {
      console.error('Error creating thread:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
}));
