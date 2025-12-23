import express from 'express';
import { createJob, getJobs, getJob } from '../controller/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import itemRoutes from './itemRoutes.js';
import { updateJobContainer, getRecommendation } from '../controller/containerController.js';
import { runOptimization, compareAlgorithms } from '../controller/optimizeController.js';
import { optimizeIpLimiter, optimizeUserLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

console.log(' jobRoutes loaded, limiters:', { 
  ipLimiter: typeof optimizeIpLimiter, 
  userLimiter: typeof optimizeUserLimiter 
});

router.use(protect);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);

router.use('/:jobId/items', itemRoutes);

router.put('/:jobId/container', updateJobContainer);
router.get('/:id/recommendation', getRecommendation);

// Optimization routes
router.post('/:id/optimize', optimizeIpLimiter, optimizeUserLimiter, runOptimization);
router.get('/:id/compare', compareAlgorithms);

export default router;