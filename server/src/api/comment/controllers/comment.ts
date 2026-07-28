/**
 * comment controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::comment.comment', ({ strapi }) => ({
  async create(ctx) {
    try {
      const { answer, answerer, responsaSlug, blogSlug } = ctx.request.body.data;

      // Validate that either responsaSlug or blogSlug is provided, but not both
      if (!responsaSlug && !blogSlug) {
        return ctx.badRequest('Either responsaSlug or blogSlug is required');
      }

      if (responsaSlug && blogSlug) {
        return ctx.badRequest('Cannot specify both responsaSlug and blogSlug');
      }

      // Guard against double-submission: if an identical comment was created in the
      // last 10 seconds, return it instead of inserting a duplicate.
      const tenSecondsAgo = new Date(Date.now() - 10000);
      const duplicateFilters: Record<string, any> = {
        answerer,
        answer,
        createdAt: { $gt: tenSecondsAgo },
      };
      if (responsaSlug) {
        duplicateFilters.responsaSlug = responsaSlug;
      } else if (blogSlug) {
        duplicateFilters.blogSlug = blogSlug;
      }

      const existingComments = await strapi.entityService.findMany('api::comment.comment', {
        filters: duplicateFilters,
      }) as any[];

      if (existingComments && existingComments.length > 0) {
        return { data: existingComments[0] };
      }

      // Generate slug from answerer
      const timestamp = Date.now();
      let slug = answerer
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      // If slug is empty or very short (likely because of Hebrew chars), use a timestamp prefix
      if (slug.length < 3) {
        slug = `comment-${timestamp}`;
      } else {
        // Otherwise, append timestamp to ensure uniqueness
        slug = `${slug}-${timestamp}`;
      }

      let commentData: {
        answer: any;
        answerer: any;
        slug: string;
        publishedAt: string;
        responsa?: number;
        blog?: number;
        responsaSlug?: string;
        blogSlug?: string;
      } = {
        answer,
        answerer,
        slug,
        publishedAt: new Date().toISOString()
      };

      let populateData = {};
      let contentData = null;

      if (responsaSlug) {
        // Find the responsa by slug first
        const responsa = await strapi.entityService.findMany('api::responsa.responsa', {
          filters: { slug: responsaSlug },
          fields: ['id', 'title', 'slug', 'questioneer', 'questioneerEmail']
        }) as any[];

        if (!responsa || responsa.length === 0) {
          return ctx.notFound('Responsa not found');
        }

        contentData = responsa[0];
        commentData = { ...commentData, responsa: contentData.id, responsaSlug };
        populateData = {
          responsa: {
            fields: ['title', 'slug', 'questioneer', 'questioneerEmail']
          }
        };
      } else if (blogSlug) {
        // Find the blog by slug first
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
        commentData = { ...commentData, blog: contentData.id, blogSlug };
        populateData = {
          blog: {
            fields: ['title', 'slug'],
            populate: {
              author: {
                fields: ['name', 'email']
              }
            }
          }
        };
      }

      const comment = await strapi.entityService.create('api::comment.comment', {
        data: commentData,
        populate: populateData
      });

      // Send email notification for responsa comments
      if (responsaSlug && contentData?.questioneerEmail && contentData?.questioneerEmail.trim()) {
        const questionLink = `${process.env.FRONTEND_URL || 'https://religousphilosophy.com/'}/responsa/${contentData.slug}`;

        try {
          await strapi.service("api::email.email").sendStyledEmail({
            to: contentData.questioneerEmail,
            subject: `תשובה לשאלתכם: ${contentData.title}`,
            template: 'questionResponse',
            data: {
              questioneer: contentData.questioneer,
              questionTitle: contentData.title,
              questionLink,
              plainText: `שלום ${contentData.questioneer}, קיבלתם תשובה לשאלתכם: "${contentData.title}". ניתן לראות את התשובה המלאה בקישור הבא: ${questionLink}`
            }
          });

        } catch (emailError) {
          console.error('Failed to send email notification:', emailError instanceof Error ? emailError.message : emailError);
          // Don't fail the comment creation if email fails
        }
      } else if (blogSlug && contentData?.author?.email) {
        // Send email notification to blog author
        const blogLink = `${process.env.FRONTEND_URL || 'https://religousphilosophy.com/'}/blog/${contentData.slug}`;

        try {
          await strapi.service("api::email.email").sendStyledEmail({
            to: contentData.author.email,
            subject: `תגובה חדשה לפוסט שלכם: ${contentData.title}`,
            template: 'blogComment',
            data: {
              authorName: contentData.author.name,
              blogTitle: contentData.title,
              blogLink,
              commenterName: answerer,
              plainText: `שלום ${contentData.author.name}, קיבלתם תגובה חדשה לפוסט שלכם: "${contentData.title}". ניתן לראות את התגובה בקישור הבא: ${blogLink}`
            }
          });

        } catch (emailError) {
          console.error('Failed to send email notification:', emailError instanceof Error ? emailError.message : emailError);
          // Don't fail the comment creation if email fails
        }
      }

      return { data: comment };
    } catch (error) {
      console.error('Error creating comment:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
})); 