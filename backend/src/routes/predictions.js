import express from 'express';
import { predictUtilization, getMLStatus, predictAlgorithm } from '../controller/predictionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', getMLStatus);  // Public - check if ML is online
router.get('/job/:id', protect, predictUtilization);  // Protected - get prediction for job
router.post('/algorithm', protect, predictAlgorithm);  // Protected - get algorithm recommendation

export default router;