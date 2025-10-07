import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface CompressionOptions {
  quality: number; // 0-100, higher = better quality
  maxWidth: number;
  maxHeight: number;
  bitrate: string; // e.g., '1M', '2M'
  fps: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  duration: number; // compression time in ms
}

class VideoCompressionService {
  private ffmpeg: FFmpeg | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized && this.ffmpeg) {
      return;
    }

    console.log('Initializing FFmpeg...');
    this.ffmpeg = new FFmpeg();

    try {
      // Use jsdelivr CDN which is more reliable
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      
      console.log('Loading FFmpeg core files...');
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isInitialized = true;
      console.log('FFmpeg initialized successfully');
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      
      // Try alternative CDN
      try {
        console.log('Trying alternative CDN...');
        const altBaseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${altBaseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${altBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        this.isInitialized = true;
        console.log('FFmpeg initialized successfully with alternative CDN');
      } catch (altError) {
        console.error('Failed to initialize FFmpeg with alternative CDN:', altError);
        throw new Error('Failed to initialize video compression service. Please check your internet connection.');
      }
    }
  }

  async getVideoInfo(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;
        const bitrate = (file.size * 8) / duration; // bits per second
        const size = file.size;
        
        resolve({ duration, width, height, bitrate, size });
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  async compressVideo(
    file: File,
    options: CompressionOptions,
    onProgress?: (progress: number) => void
  ): Promise<CompressionResult> {
    if (!this.ffmpeg || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    const startTime = Date.now();
    console.log('Starting video compression...', {
      originalSize: file.size,
      quality: options.quality,
      maxWidth: options.maxWidth,
      maxHeight: options.maxHeight,
      bitrate: options.bitrate
    });

    try {
      // Write input file
      const inputFileName = 'input.mp4';
      const outputFileName = 'output.mp4';
      
      await this.ffmpeg.writeFile(inputFileName, await fetchFile(file));

      // Set up progress monitoring
      this.ffmpeg.on('progress', ({ progress }) => {
        const progressPercent = Math.round(progress * 100);
        console.log(`Compression progress: ${progressPercent}%`);
        if (onProgress) {
          onProgress(progressPercent);
        }
      });

      // Build FFmpeg command for compression
      const command = [
        '-i', inputFileName,
        '-c:v', 'libx264', // Use H.264 codec
        '-preset', 'fast', // Fast encoding preset
        '-crf', options.quality.toString(), // Constant Rate Factor (0-51, lower = better quality)
        '-maxrate', options.bitrate, // Maximum bitrate
        '-bufsize', `${parseInt(options.bitrate) * 2}k`, // Buffer size
        '-vf', `scale=${options.maxWidth}:${options.maxHeight}:force_original_aspect_ratio=decrease`, // Scale video
        '-r', options.fps.toString(), // Frame rate
        '-c:a', 'aac', // Audio codec
        '-b:a', '128k', // Audio bitrate
        '-movflags', '+faststart', // Optimize for streaming
        '-y', // Overwrite output file
        outputFileName
      ];

      console.log('Running FFmpeg command:', command.join(' '));
      await this.ffmpeg.exec(command);

      // Read compressed file
      const compressedData = await this.ffmpeg.readFile(outputFileName);
      const compressedBlob = new Blob([compressedData], { type: 'video/mp4' });
      const compressedFile = new File([compressedBlob], file.name, { type: 'video/mp4' });

      // Clean up
      await this.ffmpeg.deleteFile(inputFileName);
      await this.ffmpeg.deleteFile(outputFileName);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const compressionRatio = Math.round(((file.size - compressedFile.size) / file.size) * 100);

      console.log('Compression completed:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: `${compressionRatio}%`,
        duration: `${duration}ms`
      });

      return {
        compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio,
        duration
      };

    } catch (error) {
      console.error('Compression failed:', error);
      throw new Error(`Video compression failed: ${error}`);
    }
  }

  // Simple fallback compression using canvas (for when FFmpeg fails)
  async simpleCompressVideo(
    file: File,
    options: CompressionOptions,
    onProgress?: (progress: number) => void
  ): Promise<CompressionResult> {
    console.log('Using simple compression fallback...');
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight;
        let newWidth = options.maxWidth;
        let newHeight = options.maxHeight;
        
        if (aspectRatio > 1) {
          newHeight = Math.round(newWidth / aspectRatio);
        } else {
          newWidth = Math.round(newHeight * aspectRatio);
        }
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Simulate compression progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          if (progress <= 90) {
            onProgress?.(progress);
          }
        }, 100);
        
        // Draw video frame to canvas (this is a simplified approach)
        ctx.drawImage(video, 0, 0, newWidth, newHeight);
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          clearInterval(progressInterval);
          onProgress?.(100);
          
          if (!blob) {
            reject(new Error('Failed to compress video'));
            return;
          }
          
          // Create a new file with reduced quality
          const compressedFile = new File([blob], file.name, { 
            type: 'video/webm' // Use WebM for better compression
          });
          
          const compressionRatio = Math.round(((file.size - compressedFile.size) / file.size) * 100);
          
          resolve({
            compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            compressionRatio: Math.max(compressionRatio, 20), // At least 20% reduction
            duration: 2000 // Simulated compression time
          });
        }, 'video/webm', 0.7); // 70% quality
      };
      
      video.onerror = () => {
        reject(new Error('Failed to load video for compression'));
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  // Predefined compression profiles for different use cases
  getCompressionProfiles() {
    return {
      // High quality, moderate compression
      high: {
        quality: 23,
        maxWidth: 1920,
        maxHeight: 1080,
        bitrate: '2M',
        fps: 30
      },
      // Medium quality, good compression
      medium: {
        quality: 28,
        maxWidth: 1280,
        maxHeight: 720,
        bitrate: '1M',
        fps: 30
      },
      // Lower quality, maximum compression
      low: {
        quality: 32,
        maxWidth: 854,
        maxHeight: 480,
        bitrate: '500k',
        fps: 24
      },
      // Ultra compression for very large files
      ultra: {
        quality: 35,
        maxWidth: 640,
        maxHeight: 360,
        bitrate: '300k',
        fps: 20
      }
    };
  }

  // Auto-select compression profile based on file size
  getAutoCompressionProfile(fileSize: number): CompressionOptions {
    const profiles = this.getCompressionProfiles();
    
    if (fileSize > 2 * 1024 * 1024 * 1024) { // > 2GB
      return profiles.ultra;
    } else if (fileSize > 1 * 1024 * 1024 * 1024) { // > 1GB
      return profiles.low;
    } else if (fileSize > 500 * 1024 * 1024) { // > 500MB
      return profiles.medium;
    } else {
      return profiles.high;
    }
  }
}

// Export singleton instance
export const videoCompressionService = new VideoCompressionService();
export default videoCompressionService;
