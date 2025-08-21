import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { generateSignature } from '../services/cloudinary.js';

const router = Router();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: 'dl3cveveh',
  api_key: '571557557596629',
  api_secret: 'cW4imhAD_yca4RW_4RoZqD64Xfk',
  secure: true,
});

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// POST /api/cloudinary/upload - Direct upload endpoint
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('Uploading file:', req.file.originalname, req.file.size);

    // Upload to Cloudinary using the buffer
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'unafeed',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    console.log('Upload successful:', result.secure_url);

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      details: error.message 
    });
  }
});

// POST /api/cloudinary/signature - Get signature for signed upload
router.post('/signature', (req, res) => {
  try {
    const { folder = 'unafeed' } = req.body;
    const signatureData = generateSignature({ folder });
    res.json(signatureData);
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Failed to generate signature' });
  }
});

export default router;
