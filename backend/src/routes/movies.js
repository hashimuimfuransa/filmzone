const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  getTrendingMovies,
  movieValidation
} = require('../controllers/movieController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../config/cloudinary');

// Public routes
router.get('/', optionalAuth, getMovies);
router.get('/trending', getTrendingMovies);
router.get('/:id', optionalAuth, getMovieById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, movieValidation, createMovie);
router.put('/:id', authenticateToken, requireAdmin, movieValidation, updateMovie);
router.delete('/:id', authenticateToken, requireAdmin, deleteMovie);

// File upload routes (admin only)
router.post('/upload/poster', authenticateToken, requireAdmin, uploadImage.single('poster'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({
    message: 'Poster uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename
  });
});

router.post('/upload/video', authenticateToken, requireAdmin, (req, res) => {
  console.log('Video upload request received');
  console.log('Request headers:', req.headers);
  
  // Set longer timeout for large files
  req.setTimeout(20 * 60 * 1000); // 20 minutes
  res.setTimeout(20 * 60 * 1000); // 20 minutes
  
  // Enhanced video upload with better error handling and progress tracking
  const upload = uploadVideo.single('video');
  
  upload(req, res, (err) => {
    console.log('Multer upload callback triggered');
    
    if (err) {
      console.error('Video upload error:', err);
      console.error('Error details:', {
        code: err.code,
        message: err.message,
        field: err.field,
        storageErrors: err.storageErrors
      });
      
      // Handle specific Cloudinary errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'Video file is too large. Maximum size is 5GB.',
          code: 'FILE_TOO_LARGE'
        });
      }
      
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
          message: 'Unexpected file field. Expected "video" field.',
          code: 'INVALID_FIELD'
        });
      }
      
      if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ 
          message: 'Invalid video format. Supported formats: MP4, AVI, MOV, MKV, WebM',
          code: 'INVALID_FORMAT'
        });
      }
      
      return res.status(500).json({ 
        message: 'Failed to upload video. Please try again.',
        code: 'UPLOAD_FAILED',
        error: err.message
      });
    }
    
    console.log('No multer errors, checking file...');
    console.log('Request file:', req.file);
    
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ 
        message: 'No video file uploaded',
        code: 'NO_FILE'
      });
    }
    
    // Log successful upload
    console.log(`Video uploaded successfully: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log('File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    res.json({
      message: 'Video uploaded successfully',
      url: req.file.path,
      publicId: req.file.filename,
      size: req.file.size,
      format: req.file.mimetype,
      duration: req.file.duration || null // Cloudinary provides duration for videos
    });
  });
});

// Proxy upload to Cloudinary (CORS-free) with streaming
router.post('/upload/video/proxy', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Proxy upload request received');
    
    // Set longer timeout for large files
    req.setTimeout(30 * 60 * 1000); // 30 minutes
    res.setTimeout(30 * 60 * 1000); // 30 minutes
    
    const multer = require('multer');
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const os = require('os');
        const path = require('path');
        const tempDir = path.join(os.tmpdir(), 'filmzone_temp');
        require('fs').mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
      },
      filename: (req, file, cb) => {
        cb(null, `temp_${Date.now()}_${file.originalname}`);
      }
    });
    
    const upload = multer({ 
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB max
      }
    }).single('video');
    
    upload(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload failed', details: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      try {
        console.log(`Proxy uploading to Cloudinary: ${req.file.originalname} (${req.file.size} bytes)`);
        
        // Upload to Cloudinary using file stream (not memory)
        const cloudinary = require('cloudinary').v2;
        const fs = require('fs');
        
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'video',
          folder: 'filmzone/videos',
          use_filename: true,
          unique_filename: true,
        });
        
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
        
        console.log('Proxy upload completed:', result.secure_url);
        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes
        });

      } catch (uploadError) {
        console.error('Proxy upload error:', uploadError);
        
        // Clean up temporary file on error
        if (req.file && req.file.path) {
          try {
            require('fs').unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Failed to clean up temp file:', cleanupError);
          }
        }
        
        res.status(500).json({ 
          error: 'Failed to upload video',
          details: uploadError.message 
        });
      }
    });

  } catch (error) {
    console.error('Proxy upload error:', error);
    res.status(500).json({ 
      error: 'Proxy upload failed',
      details: error.message 
    });
  }
});

// Get Cloudinary unsigned upload preset for direct upload
router.post('/upload/video/preset', authenticateToken, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'filmzone_videos',
      folder: 'filmzone/videos'
    });
    
  } catch (error) {
    console.error('Preset generation error:', error);
    res.status(500).json({ 
      error: 'Failed to get upload preset',
      details: error.message 
    });
  }
});

// Get Cloudinary signature for direct upload
router.post('/upload/video/signature', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const crypto = require('crypto');
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'filmzone/videos';
    
    // Create signature for video upload
    const params = {
      timestamp: timestamp,
      folder: folder,
      resource_type: 'video'
    };
    
    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
    
    res.json({
      success: true,
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY
    });
    
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload signature',
      details: error.message 
    });
  }
});

// Check upload status for resume capability
router.post('/upload/video/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { uploadId } = req.body;
    
    console.log(`Checking upload status: ${uploadId}`);
    
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const uploadDir = path.join(os.tmpdir(), 'filmzone_uploads', uploadId);
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({ 
        success: true, 
        existingChunks: 0,
        message: 'Upload session not found' 
      });
    }
    
    // Count existing chunks
    let existingChunks = 0;
    const metadataPath = path.join(uploadDir, 'metadata.json');
    
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      existingChunks = metadata.uploadedChunks || 0;
    }
    
    res.json({ 
      success: true, 
      existingChunks,
      message: `Found ${existingChunks} existing chunks` 
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      error: 'Failed to check upload status',
      details: error.message 
    });
  }
});

// Initialize chunked upload session
router.post('/upload/video/init', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename, fileSize, totalChunks, chunkSize } = req.body;
    
    console.log(`Initializing chunked upload: ${filename} (${fileSize} bytes, ${totalChunks} chunks)`);
    
    // Generate unique upload ID
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create upload session directory in OS temp to avoid nodemon restarts
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const uploadDir = path.join(os.tmpdir(), 'filmzone_uploads', uploadId);
    fs.mkdirSync(uploadDir, { recursive: true });
    
    // Store upload metadata
    const metadata = {
      uploadId,
      filename,
      fileSize,
      totalChunks,
      chunkSize,
      uploadedChunks: 0,
      createdAt: new Date()
    };
    
    fs.writeFileSync(path.join(uploadDir, 'metadata.json'), JSON.stringify(metadata));
    
    res.json({ 
      success: true, 
      uploadId,
      message: 'Upload session initialized' 
    });
    
  } catch (error) {
    console.error('Upload initialization error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize upload session',
      details: error.message 
    });
  }
});

// Simple streaming upload - bypass chunking for reliability
router.post('/upload/video/stream', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Starting streaming upload...');
    
    // Set longer timeout for large files
    req.setTimeout(60 * 60 * 1000); // 1 hour
    res.setTimeout(60 * 60 * 1000); // 1 hour
    
    const multer = require('multer');
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    // Use disk storage to prevent memory issues
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const tempDir = path.join(os.tmpdir(), 'filmzone_temp');
        fs.mkdirSync(tempDir, { recursive: true });
        cb(null, tempDir);
      },
      filename: (req, file, cb) => {
        cb(null, `temp_${Date.now()}_${file.originalname}`);
      }
    });
    
    const upload = multer({ 
      storage: storage,
      limits: {
        fileSize: 10 * 1024 * 1024 * 1024, // 10GB max
      }
    }).single('video');
    
    upload(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload failed', details: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      try {
        console.log(`Streaming upload received: ${req.file.originalname} (${req.file.size} bytes)`);
        
        // Upload to Cloudinary using file stream (not memory)
        const cloudinary = require('cloudinary').v2;
        
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'video',
          folder: 'filmzone/videos',
          use_filename: true,
          unique_filename: true,
        });
        
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
        
        console.log('Streaming upload completed:', result.secure_url);
        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes
        });

      } catch (uploadError) {
        console.error('Streaming upload error:', uploadError);
        
        // Clean up temporary file on error
        if (req.file && req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.error('Failed to clean up temp file:', cleanupError);
          }
        }
        
        res.status(500).json({ 
          error: 'Failed to upload video',
          details: uploadError.message 
        });
      }
    });

  } catch (error) {
    console.error('Streaming upload error:', error);
    res.status(500).json({ 
      error: 'Streaming upload failed',
      details: error.message 
    });
  }
});

// Finalize chunked upload
router.post('/upload/video/finalize', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { uploadId } = req.body;
    
    console.log(`Finalizing upload: ${uploadId}`);
    
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const uploadDir = path.join(os.tmpdir(), 'filmzone_uploads', uploadId);
    
    // Read metadata
    const metadataPath = path.join(uploadDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      return res.status(400).json({ 
        error: 'Upload session not found',
        details: 'Metadata file missing' 
      });
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    console.log(`Reassembling file: ${metadata.filename} (${metadata.uploadedChunks}/${metadata.totalChunks} chunks)`);
    
    // Verify all chunks exist
    let missingChunks = [];
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk_${i}`);
      if (!fs.existsSync(chunkPath)) {
        missingChunks.push(i);
      }
    }
    
    if (missingChunks.length > 0) {
      return res.status(400).json({ 
        error: 'Missing chunks',
        details: `Missing chunks: ${missingChunks.join(', ')}` 
      });
    }
    
    // Reassemble file with proper error handling
    const outputPath = path.join(os.tmpdir(), 'filmzone_temp', `${metadata.filename}`);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const writeStream = fs.createWriteStream(outputPath);
    let totalBytesWritten = 0;
    
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkPath = path.join(uploadDir, `chunk_${i}`);
      const chunkData = fs.readFileSync(chunkPath);
      writeStream.write(chunkData);
      totalBytesWritten += chunkData.length;
      console.log(`Written chunk ${i + 1}/${metadata.totalChunks} (${chunkData.length} bytes)`);
    }
    
    writeStream.end();
    
    // Wait for write stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    // Verify file was written correctly
    if (!fs.existsSync(outputPath)) {
      throw new Error('Output file was not created');
    }
    
    const outputFileSize = fs.statSync(outputPath).size;
    console.log(`Reassembled file size: ${outputFileSize} bytes (expected: ${metadata.fileSize} bytes)`);
    
    if (outputFileSize === 0) {
      throw new Error('Reassembled file is empty');
    }
    
    if (outputFileSize !== metadata.fileSize) {
      console.warn(`File size mismatch: expected ${metadata.fileSize}, got ${outputFileSize}`);
    }
    
    // Upload to Cloudinary
    console.log('Uploading reassembled file to Cloudinary...');
    const cloudinary = require('cloudinary').v2;
    const result = await cloudinary.uploader.upload(outputPath, {
      resource_type: 'video',
      folder: 'filmzone/videos',
      use_filename: true,
      unique_filename: true,
    });

    // Clean up temporary files
    fs.unlinkSync(outputPath);
    fs.rmdirSync(uploadDir, { recursive: true });

    console.log('Chunked upload finalized:', result.secure_url);
    
    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    });

  } catch (error) {
    console.error('Upload finalization error:', error);
    res.status(500).json({ 
      error: 'Failed to finalize upload',
      details: error.message 
    });
  }
});

module.exports = router;
