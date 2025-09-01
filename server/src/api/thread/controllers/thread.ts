/**
 * thread controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::thread.thread', ({ strapi }) => ({
  async create(ctx) {
    console.log('🚀 Thread controller create method called');
    console.log('Request body:', ctx.request.body);

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
      console.log('🔍 Finding parent comment by slug:', parentCommentSlug);
      const parentComment = await strapi.entityService.findMany('api::comment.comment', {
        filters: { slug: parentCommentSlug },
        fields: ['id', 'answerer', 'slug']
      }) as any[];

      if (!parentComment || parentComment.length === 0) {
        console.log('❌ Parent comment not found for slug:', parentCommentSlug);
        return ctx.notFound('Parent comment not found');
      }

      console.log('✅ Found parent comment:', parentComment[0]);

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
        console.log('🔍 Finding responsa by slug:', responsaSlug);

        // Find the responsa by slug
        const responsa = await strapi.entityService.findMany('api::responsa.responsa', {
          filters: { slug: responsaSlug },
          fields: ['id', 'title', 'slug', 'questioneer', 'questioneerEmail']
        }) as any[];

        if (!responsa || responsa.length === 0) {
          console.log('❌ Responsa not found for slug:', responsaSlug);
          return ctx.notFound('Responsa not found');
        }

        contentData = responsa[0];
        threadData = { ...threadData, responsa: contentData.id, responsaSlug };
        console.log('✅ Found responsa:', contentData);
      } else if (blogSlug) {
        console.log('🔍 Finding blog by slug:', blogSlug);

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
          console.log('❌ Blog not found for slug:', blogSlug);
          return ctx.notFound('Blog not found');
        }

        contentData = blog[0];
        threadData = { ...threadData, blog: contentData.id, blogSlug };
        console.log('✅ Found blog:', contentData);
      }

      console.log('📝 Creating thread with data:', threadData);

      const thread = await strapi.entityService.create('api::thread.thread', {
        data: threadData,
        populate: {
          parentComment: {
            fields: ['answerer', 'slug']
          }
        }
      });

      console.log('✅ Thread created successfully:', thread);

      return { data: thread };
    } catch (error) {
      console.error('❌ Error creating thread:', error);
      throw error;
    }
  }
}));
