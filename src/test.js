const tf = require('@tensorflow/tfjs'); // pakai tfjs biasa untuk load dari URL HTTP

async function loadModel() {
  try {
    // Load model dari URL HTTP, ganti dengan URL model kamu
    const model = await tf.loadLayersModel('http://localhost:5000/tfjs_model/model.json');
    return model;
  } catch (error) {
    console.error('Gagal memuat model:', error);
    throw error;
  }
}

async function runPrediction() {
  try {
    const model = await loadModel();

    const inputData = [1, 2, 3, 4, 5, 6, 7, 8];
    const inputTensor = tf.tensor2d([inputData], [1, 8]);

    const outputTensor = model.predict(inputTensor);
    const outputData = await outputTensor.data();

    console.log('Prediction:', outputData[0]);

    inputTensor.dispose();
    outputTensor.dispose();
  } catch (error) {
    console.error('Terjadi kesalahan saat prediksi:', error);
  }
}

runPrediction();
