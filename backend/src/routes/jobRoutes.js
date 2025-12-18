import express from 'express';
import { createJob, getJobs, getJob } from '../controller/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import itemRoutes from './itemRoutes.js';
import { updateJobContainer, getRecommendation } from '../controller/containerController.js';
import { runOptimization, getResults, resetOptimization } from '../controller/optimizationController.js';

const router = express.Router();

router.use(protect);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);

router.use('/:jobId/items', itemRoutes);

router.put('/:jobId/container', updateJobContainer);
router.get('/:id/recommendation', getRecommendation);

// Optimization routes
router.post('/:id/optimize', runOptimization);
router.get('/:id/results', getResults);
router.post('/:id/reset', resetOptimization);

export default router;