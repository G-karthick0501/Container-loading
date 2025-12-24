import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export async function getRecommendedAlgorithm(items, container) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-algorithm`, {
      items: items.map(item => ({
        length: item.length,
        width: item.width,
        height: item.height,
        quantity: item.quantity || 1
      })),
      container: {
        length: container.length,
        width: container.width,
        height: container.height
      }
    }, { timeout: 5000 });

    return {
      algorithm: response.data.recommended_algorithm,
      confidence: response.data.confidence,
      probabilities: response.data.all_probabilities
    };
  } catch (error) {
    console.error('ML Service error:', error.message);
    return { algorithm: 'extreme-points', confidence: 0, fallback: true };
  }
}

export async function getPrediction(items, container) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, {
      items: items.map(item => ({
        length: item.length, width: item.width, height: item.height,
        quantity: item.quantity || 1
      })),
      container
    }, { timeout: 5000 });
    return response.data;
  } catch (error) {
    return { error: error.message };
  }
}

export async function checkMLHealth() {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
    return response.data;
  } catch (error) {
    return { status: 'unavailable', error: error.message };
  }
}