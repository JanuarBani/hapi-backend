const { predict } = require('./predictService');
const { recommendMajor } = require('./recommendMajor');

const prediksiJurusanHandler = async (request, h) => {
  try {
    // eslint-disable-next-line camelcase
    const { scores, test_type } = request.payload;

    // eslint-disable-next-line camelcase
    if (!test_type || !['science', 'humanities'].includes(test_type)) {
      return h
        .response({
          error: true,
          message: 'test_type harus "science" atau "humanities"',
        })
        .code(400);
    }

    if (!scores || typeof scores !== 'object') {
      return h
        .response({
          error: true,
          message: 'scores harus berupa objek dengan nilai skor',
        })
        .code(400);
    }

    const expectedKeys =
      // eslint-disable-next-line camelcase
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

    const missing = expectedKeys.filter((k) => !(k in scores));
    if (missing.length > 0) {
      return h
        .response({
          error: true,
          message: `scores harus mengandung semua fitur berikut: ${expectedKeys.join(
            ', '
          )}`,
        })
        .code(400);
    }

    const inputArray = expectedKeys.map((k) => scores[k]);
    if (!inputArray.every((val) => typeof val === 'number' && !isNaN(val))) {
      return h
        .response({
          error: true,
          message: 'Semua nilai skor harus berupa angka valid',
        })
        .code(400);
    }

    if (!inputArray.every((val) => val >= 0 && val <= 1000)) {
      return h
        .response({
          error: true,
          message: 'Semua nilai skor harus antara 0 dan 1000',
        })
        .code(400);
    }

    // eslint-disable-next-line camelcase
    const result = await recommendMajor({ test_type, scores });
    console.log('🔥 Hasil dari FastAPI:', result);

    return h
      .response({
        error: false,
        recommendations: result.recommendations, // Jamak, sesuai FastAPI
        confidence: result.confidence,
      })
      .code(200);
  } catch (err) {
    console.error('❌ Error saat prediksi:', err);
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
    const inputData = request.payload;

    if (!inputData || typeof inputData !== 'object') {
      return h
        .response({
          error: true,
          message: 'Input harus berupa objek JSON',
        })
        .code(400);
    }

    const expectedKeys = [
      'Linguistic',
      'Musical',
      'Bodily',
      'Logical - Mathematical',
      'Spatial-Visualization',
      'Interpersonal',
      'Intrapersonal',
      'Naturalist',
      'math_score',
      'physics_score',
      'biology_score',
      'english_score',
      'history_score',
      'chemistry_score',
      'geography_score',
      'weekly_self_study_hours',
      'absence_days',
    ];

    // Validasi jumlah dan nama key
    const missing = expectedKeys.filter((key) => !(key in inputData));
    if (missing.length > 0) {
      return h
        .response({
          error: true,
          message: `Fitur berikut tidak ditemukan: ${missing.join(', ')}`,
        })
        .code(400);
    }

    const allNumbers = expectedKeys.every(
      (key) => typeof inputData[key] === 'number' && !isNaN(inputData[key])
    );

    if (!allNumbers) {
      return h
        .response({
          error: true,
          message: 'Semua nilai fitur harus berupa angka valid',
        })
        .code(400);
    }

    const result = await predict(inputData);

    return h
      .response({
        error: false,
        // eslint-disable-next-line camelcase
        predicted_job: result.predicted_job,
        confidence: result.confidence,
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
