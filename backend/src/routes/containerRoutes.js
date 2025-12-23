import express from 'express';
import { 
  getContainers, 
  getContainer, 
  getTransportModes 
} from '../controller/containerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/modes', getTransportModes);  // Must be before /:id
router.get('/', getContainers);
router.get('/:id', getContainer);

export default router;