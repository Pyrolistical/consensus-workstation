export default {
  plugins: ['@snowpack/plugin-typescript'],
  routes: [
    { match: 'routes', src: '/events', dest: '/events/index.html' }
  ],
};