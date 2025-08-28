/**
 * A set of functions called "actions" for `email`
 */

export default {
  send: async (ctx, next) => {
    try {
      const res = await strapi.service("api::email.email").sendEmail(ctx);
      ctx.body = res.message;
    } catch (err) {
      ctx.body = err;
    }
  },
};
