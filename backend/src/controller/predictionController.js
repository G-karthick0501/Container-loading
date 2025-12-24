import prisma from '../config/prisma.js';
import { getPrediction, getRecommendedAlgorithm, checkMLHealth } from '../services/mlService.js';

export const predictUtilization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get job with items and container
    const job = await prisma.job.findFirst({
      where: { id, userId },
      include: { 
        items: true,
        container: true
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.items.length === 0) {
      return res.status(400).json({ error: 'No items to predict' });
    }

    if (!job.container && !job.customLength) {
      return res.status(400).json({ error: 'No container selected' });
    }

    // Prepare container data
    const container = job.container || {
      length: job.customLength,
      width: job.customWidth,
      height: job.customHeight,
      maxWeight: job.customMaxWeight || 999999
    };

    // Format items for ML service
    const items = job.items.map(item => ({
      length: item.length,
      width: item.width,
      height: item.height,
      weight: item.weight,
      quantity: item.quantity
    }));

    // Call ML service
    const prediction = await getPrediction(items, container);

    if (!prediction || prediction.error) {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        fallback: true,
        message: 'Prediction service is temporarily unavailable. You can still run optimization.'
      });
    }

    res.json({
      prediction: prediction.predicted_utilization,
      confidence: prediction.confidence,
      features: prediction.feature_summary,
      jobId: job.id
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to get prediction' });
  }
};

export const predictAlgorithm = async (req, res) => {
  try {
    const { items, container } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    if (!container) {
      return res.status(400).json({ error: 'No container provided' });
    }

    // Call ML service for algorithm recommendation
    const recommendation = await getRecommendedAlgorithm(items, container);

    res.json({
      algorithm: recommendation.algorithm,
      confidence: recommendation.confidence,
      probabilities: recommendation.probabilities,
      fallback: recommendation.fallback || false
    });
  } catch (error) {
    console.error('Algorithm prediction error:', error);
    res.status(500).json({ 
      error: 'Failed to get algorithm recommendation',
      algorithm: 'extreme-points',
      confidence: 0,
      fallback: true
    });
  }
};

export const getMLStatus = async (req, res) => {
  const health = await checkMLHealth();
  res.json({ 
    status: health.status === 'healthy' ? 'online' : 'offline',
    service: 'ml-prediction',
    models: {
      utilization: health.utilization_model || false,
      algorithm: health.algorithm_model || false
    }
  });
};