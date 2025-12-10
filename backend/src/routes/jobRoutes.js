import express from 'express';
import { createJob, getJobs, getJob } from '../controller/jobController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All job routes are protected
router.use(protect);

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);

export default router;