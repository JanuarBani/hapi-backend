'use strict';

const Hapi = require('@hapi/hapi');
const routes = require('./routes');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['https://nexa-path.vercel.app'],
        credentials: true, // ✅ Dukung cookies/credentials
        headers: ['Accept', 'Content-Type', 'Authorization'], // ✅ Header yang diizinkan
        exposedHeaders: ['Accept', 'Content-Type', 'Authorization'], // ✅ Opsional
        additionalHeaders: ['Content-Type', 'Authorization'], // ✅ Tambahan header
        // ❌ Jangan tambahkan "methods" di sini!
      },
    },
  });

  server.route(routes);

  await server.start();
  console.log(`🚀 Server Hapi berjalan di: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
