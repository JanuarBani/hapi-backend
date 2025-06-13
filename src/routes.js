const { prediksiCareerHandler, prediksiJurusanHandler } = require('./handler');

const routes = [
  // Route root untuk memastikan server berjalan dengan baik
  {
    method: 'GET',
    path: '/',
    handler: () => 'Server Hapi berjalan dengan baik!',
  },
  // Route API prediksi karir
  {
    method: 'POST',
    path: '/api/prediksi',
    handler: prediksiCareerHandler,
    options: {
      description: 'Prediksi karir berdasarkan input',
      tags: ['api'],
    },
  },

  {
    method: 'POST',
    path: '/api/prediksi-jurusan',
    handler: prediksiJurusanHandler,
    options: {
      description: 'Prediksi jurusan berdasarkan input skor UTBK',
      tags: ['api'],
    },
  },

  // (Optional) fallback route untuk menangani route tidak ditemukan
  {
    method: '*',
    path: '/{any*}',
    handler: (request, h) =>
      h
        .response({
          statusCode: 404,
          error: 'Not Found',
          message: 'Route tidak ditemukan',
        })
        .code(404),
  },
];

module.exports = routes;
