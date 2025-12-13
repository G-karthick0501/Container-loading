import express from 'express';
import { createItem, getItemsByJob, updateItem, deleteItem, uploadItemsCsv } from '../controller/itemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';  // ADD THIS

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post('/', createItem);
router.get('/', getItemsByJob);
router.put('/:itemId', updateItem);
router.delete('/:itemId', deleteItem);
router.post('/csv', upload.single('file'), uploadItemsCsv);  // CHANGED

export default router;