export default {
  routes: [
    {
      method: 'POST',
      path: '/terms/:id/view',
      handler: 'term.updateViewCount',
      config: {
        auth: false,
      },
    },
  ],
};
