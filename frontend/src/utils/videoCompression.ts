import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export interface CompressionOptions {
  quality: 'low' | 'medium' | 'high';
  maxSizeMB: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  duration: number;
}

class VideoCompressionService {
  private ffmpeg: FFmpeg | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.ffmpeg = new FFmpeg();
      
      // Load FFmpeg
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize FFmpeg:', error);
      throw new Error('Failed to initialize video compression service');
    }
  }

  async compressVideo(
    file: File,
    options: CompressionOptions,
    onProgress?: (progress: number) => void
  ): Promise<CompressionResult> {
    if (!this.ffmpeg || !this.isInitialized) {
      await this.initialize();
    }

    // Ensure FFmpeg is initialized
    if (!this.ffmpeg) {
      throw new Error('Failed to initialize FFmpeg');
    }

    const startTime = Date.now();
    const originalSize = file.size;
    
    try {
      // Set up progress callback
      if (onProgress) {
        this.ffmpeg.on('progress', ({ progress }) => {
          onProgress(Math.round(progress * 100));
        });
      }

      // Write input file
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(file));

      // Determine compression settings based on quality
      const compressionSettings = this.getCompressionSettings(options);
      
      // Execute compression
      await this.ffmpeg.exec([
        '-i', 'input.mp4',
        ...compressionSettings,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        'output.mp4'
      ]);

      // Read compressed file
      const compressedData = await this.ffmpeg.readFile('output.mp4');
      const compressedBlob = new Blob([compressedData], { type: 'video/mp4' });
      const compressedFile = new File([compressedBlob], file.name, { type: 'video/mp4' });

      // Clean up
      await this.ffmpeg.deleteFile('input.mp4');
      await this.ffmpeg.deleteFile('output.mp4');

      const endTime = Date.now();
      const duration = endTime - startTime;
      const compressedSize = compressedFile.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      return {
        compressedFile,
        originalSize,
        compressedSize,
        compressionRatio,
        duration
      };
    } catch (error) {
      console.error('Video compression failed:', error);
      throw new Error('Failed to compress video');
    }
  }

  private getCompressionSettings(options: CompressionOptions): string[] {
    const settings: string[] = [];

    // Video codec and quality
    switch (options.quality) {
      case 'low':
        settings.push('-c:v', 'libx264', '-crf', '28', '-preset', 'fast');
        break;
      case 'medium':
        settings.push('-c:v', 'libx264', '-crf', '23', '-preset', 'medium');
        break;
      case 'high':
        settings.push('-c:v', 'libx264', '-crf', '18', '-preset', 'slow');
        break;
    }

    // Resolution scaling
    if (options.maxWidth || options.maxHeight) {
      let scaleFilter = 'scale=';
      if (options.maxWidth && options.maxHeight) {
        scaleFilter += `${options.maxWidth}:${options.maxHeight}`;
      } else if (options.maxWidth) {
        scaleFilter += `${options.maxWidth}:-1`;
      } else if (options.maxHeight) {
        scaleFilter += `-1:${options.maxHeight}`;
      }
      scaleFilter += ':flags=lanczos';
      settings.push('-vf', scaleFilter);
    }

    // Bitrate limiting based on target size
    if (options.maxSizeMB > 0) {
      const targetBitrate = Math.floor((options.maxSizeMB * 8 * 1024) / 60); // Rough estimate for 1 minute
      settings.push('-b:v', `${targetBitrate}k`, '-maxrate', `${targetBitrate}k`, '-bufsize', `${targetBitrate * 2}k`);
    }

    return settings;
  }

  async estimateCompressionTime(fileSize: number): Promise<number> {
    // Rough estimation: 1MB per second for compression
    return Math.max(10, Math.floor(fileSize / (1024 * 1024)));
  }

  async getVideoInfo(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    bitrate: number;
    size: number;
  }> {
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

  destroy(): void {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.ffmpeg = null;
      this.isInitialized = false;
    }
  }
}

export const videoCompressionService = new VideoCompressionService();
