export default {
  routes: [
    {
      method: 'POST',
      path: '/writings/:id/view',
      handler: 'writing.updateViewCount',
      config: {
        auth: false,
      },
    },
  ],
};
