const axios = require('axios');

const API = process.env.API_URL || 'https://jurusan-production.up.railway.app/recommend';

async function recommendMajor(formData) {
  try {
    const response = await axios.post(API, formData, {
      headers: { 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (err) {
    console.error('❌ Gagal memanggil API:', err.message);
    throw new Error(
      err.response?.data?.error || 'Terjadi kesalahan saat memproses rekomendasi jurusan'
    );
  }
}

module.exports = { recommendMajor };
