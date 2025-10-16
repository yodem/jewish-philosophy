export default {
  routes: [
    {
      method: 'POST',
      path: '/blogs/:id/view',
      handler: 'blog.updateViewCount',
      config: {
        auth: false,
      },
    },
  ],
};
