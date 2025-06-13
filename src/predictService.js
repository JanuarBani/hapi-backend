const axios = require('axios');

const API_URL =
  process.env.API_URL || 'https://web-production-9a610.up.railway.app/predict';

/**
 * Mengirim data ke backend FastAPI dan mengembalikan hasil prediksi
 * @param {Object} formData - Objek 16 fitur
 * @returns {Promise<{ predicted_job: string, confidence: number }>}
 */
async function predict(formData) {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (err) {
    console.error('❌ Gagal memanggil API:', err.message);
    throw new Error(
      err.response?.data?.error || 'Terjadi kesalahan saat memproses prediksi'
    );
  }
}

module.exports = { predict };
