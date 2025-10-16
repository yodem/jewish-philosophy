export default {
  routes: [
    {
      method: 'POST',
      path: '/videos/:id/view',
      handler: 'video.updateViewCount',
      config: {
        auth: false,
      },
    },
  ],
};
