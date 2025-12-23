import prisma from '../config/prisma.js';
import { getPrediction, checkMLHealth } from '../services/mlService.js';

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

    if (!prediction) {
      return res.status(503).json({ 
        error: 'ML service unavailable',
        fallback: true,
        message: 'Prediction service is temporarily unavailable. You can still run optimization.'
      });
    }

    res.json({
      prediction: prediction.predicted_utilization,
      confidence: prediction.confidence,
      features: prediction.features,
      jobId: job.id
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to get prediction' });
  }
};

export const getMLStatus = async (req, res) => {
  const healthy = await checkMLHealth();
  res.json({ 
    status: healthy ? 'online' : 'offline',
    service: 'ml-prediction'
  });
};