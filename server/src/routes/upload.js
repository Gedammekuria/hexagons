import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authMiddleware } from '../middleware/auth.js';
import 'dotenv/config';

// Configure Cloudinary
console.log('☁️ Configuring Cloudinary with:', { 
  cloud: process.env.CLOUDINARY_CLOUD_NAME ? 'Yes' : 'No',
  key: process.env.CLOUDINARY_API_KEY ? 'Yes' : 'No',
  secret: process.env.CLOUDINARY_API_SECRET ? 'Yes' : 'No' 
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'hexagon_uploads',
      format: path.extname(file.originalname).substring(1).toLowerCase(), // Dynamic format
      public_id: Date.now() + '-' + Math.round(Math.random() * 1E9)
    };
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Cloudinary Upload Error:', err);
      return res.status(400).json({ 
        message: err.message || 'Upload failed. Check if Cloudinary keys are set in .env' 
      });
    }

    if (!req.file) {
      console.error('❌ Upload Error: No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('✅ Cloudinary Upload Success:', req.file.path);
    // Cloudinary provides the full secure URL
    res.status(201).json({ url: req.file.path });
  });
});

export default router;
