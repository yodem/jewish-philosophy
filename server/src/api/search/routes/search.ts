export default {
  routes: [
    {
      method: 'GET',
      path: '/search',
      handler: 'search.search',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
