const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { recommendMajor } = require('./recommendMajor'); // Pastikan file ini ada

const app = express();

// Middleware CORS
app.use(
  cors({
    origin: 'http://localhost:9000', // ✅ Tanpa trailing slash
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middleware parsing body
app.use(bodyParser.json());

// Route root
app.get('/', (req, res) => {
  res.send('✅ Express server berjalan dengan baik!');
});

// Route prediksi
app.post('/api/prediksi-jurusan', async (req, res) => {
  try {
    const inputData = req.body;
    const result = await recommendMajor(inputData);
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error saat prediksi:', error);
    res.status(500).json({ error: error.message });
  }
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server Express berjalan di http://localhost:${PORT}`);
});
