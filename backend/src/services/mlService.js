const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export async function getPrediction(items, container) {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, container })
    });

    if (!response.ok) {
      throw new Error(`ML service error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ML Service error:', error.message);
    return null; // Graceful fallback - don't break if ML service is down
  }
}

export async function checkMLHealth() {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}