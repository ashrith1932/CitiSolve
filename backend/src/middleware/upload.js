import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024,  // 5MB per file
    files: 5                     // ← ADD THIS: Max 5 files per request
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});