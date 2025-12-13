import multer from 'multer';
import path from 'path';

// Where to save uploaded files temporarily
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save to uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  // Unique filename
  }
});

// Only allow CSV files
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.csv') {
    cb(null, true);   // Accept
  } else {
    cb(new Error('Only CSV files are allowed'), false);  // Reject
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB max
});
