import express from 'express';
import { createJob, getJobs, getJob } from '../controller/jobController.js';
import { protect } from '../middleware/authMiddleware.js';
import itemRoutes from './itemRoutes.js';  // ADD THIS
import {updateJobContainer,getRecommendation} from '../controller/containerController.js';

const router = express.Router();

router.use(protect);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);

router.use('/:jobId/items', itemRoutes);  // ADD THIS - mounts item routes

router.put('/:jobId/container',updateJobContainer);
router.get('/:id/recommendation',getRecommendation);

export default router;