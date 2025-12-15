import express from 'express';
import { getContainers, getContainer } from '../controller/containerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getContainers);
router.get('/:id', getContainer);

export default router;