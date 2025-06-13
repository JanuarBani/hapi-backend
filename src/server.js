'use strict';

const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['http://localhost:9000'], // Tanpa trailing slash
        credentials: true,
        additionalHeaders: ['Content-Type', 'Authorization']
      },
    },
  });


  server.route(routes);

  await server.start();
  console.log('🚀 Server berjalan di:', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

// Jalankan server
init();
