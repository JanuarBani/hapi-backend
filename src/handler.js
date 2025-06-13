const { predict } = require('./predictCareerService');
const { recommendMajor } = require('./predictJurusanService');

const prediksiJurusanHandler = async (request, h) => {
  try {
    const { scores, test_type } = request.payload;

    // Validasi test_type
    if (!test_type || (test_type !== 'science' && test_type !== 'humanities')) {
      return h
        .response({
          error: true,
          message:
            'test_type harus diisi dan bernilai "science" atau "humanities"',
        })
        .code(400);
    }

    // Validasi scores harus objek
    if (!scores || typeof scores !== 'object') {
      return h
        .response({
          error: true,
          message: 'scores harus berupa objek dengan nilai skor',
        })
        .code(400);
    }

    // Daftar fitur yang diharapkan sesuai test_type
    const expectedKeys =
      test_type === 'science'
        ? [
          'score_kpu',
          'score_kua',
          'score_ppu',
          'score_kmb',
          'score_mat_tka',
          'score_fis',
          'score_kim',
          'score_bio',
        ]
        : [
          'score_kpu',
          'score_kua',
          'score_ppu',
          'score_kmb',
          'score_mat_tka',
          'score_geo',
          'score_sej',
          'score_sos',
          'score_eko',
        ];

    // Cek semua expected keys ada di scores
    const hasAllKeys = expectedKeys.every((key) => key in scores);
    if (!hasAllKeys) {
      return h
        .response({
          error: true,
          message: `scores harus mengandung semua fitur berikut: ${expectedKeys.join(
            ', '
          )}`,
        })
        .code(400);
    }

    // Buat array input dari scores sesuai expectedKeys
    const input = expectedKeys.map((key) => scores[key]);

    // Validasi semua skor adalah angka valid (number dan bukan NaN)
    const allNumbers = input.every(
      (val) => typeof val === 'number' && !isNaN(val)
    );
    if (!allNumbers) {
      return h
        .response({
          error: true,
          message: 'Semua nilai skor harus berupa angka yang valid',
        })
        .code(400);
    }

    // Validasi nilai dalam range 0-1000 (bisa sesuaikan)
    const inRange = input.every((val) => val >= 0 && val <= 1000);
    if (!inRange) {
      return h
        .response({
          error: true,
          message: 'Semua nilai skor harus berada di antara 0 dan 1000',
        })
        .code(400);
    }

    // Panggil fungsi rekomendasi jurusan dengan input valid
    const result = await recommendMajor(input);

    // Prediksi index nilai terbesar
    const predictedIndex = result.indexOf(Math.max(...result));

    return h
      .response({
        error: false,
        prediction: result,
        topPredictionIndex: predictedIndex,
      })
      .code(200);
  } catch (err) {
    console.error('Prediction Error:', err);
    return h
      .response({
        error: true,
        message: err.message,
      })
      .code(500);
  }
};

const prediksiCareerHandler = async (request, h) => {
  try {
    const { input } = request.payload;

    // Validasi input harus array 16 angka
    if (!input || !Array.isArray(input) || input.length !== 16) {
      return h
        .response({
          error: true,
          message: 'Input harus berupa array dengan 16 angka sesuai fitur',
        })
        .code(400);
    }

    const isValid = input.every(
      (val) => typeof val === 'number' && !isNaN(val)
    );
    if (!isValid) {
      return h
        .response({
          error: true,
          message: 'Semua elemen input harus berupa angka',
        })
        .code(400);
    }

    const result = await predict(input);

    const predictedIndex = result.indexOf(Math.max(...result));

    return h
      .response({
        error: false,
        prediction: result,
        topPredictionIndex: predictedIndex,
      })
      .code(200);
  } catch (err) {
    console.error('Prediction Error:', err);
    return h
      .response({
        error: true,
        message: err.message,
      })
      .code(500);
  }
};

module.exports = {
  prediksiCareerHandler,
  prediksiJurusanHandler,
};
