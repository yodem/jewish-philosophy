export default {
  routes: [
    {
      method: 'POST',
      path: '/responsas/:id/view',
      handler: 'responsa.updateViewCount',
      config: {
        auth: false,
      },
    },
  ],
};
