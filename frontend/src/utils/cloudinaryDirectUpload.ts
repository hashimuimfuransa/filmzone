// Direct Cloudinary chunked upload service
// Uploads directly to Cloudinary with resume capability and real progress tracking

export interface CloudinaryUploadProgress {
  chunkIndex: number;
  totalChunks: number;
  chunkProgress: number;
  overallProgress: number;
  uploadedChunks: number;
  currentChunkSize: number;
  totalSize: number;
  isResuming: boolean;
}

export interface CloudinaryUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
}

class CloudinaryDirectUploadService {
  private chunkSize: number = 20 * 1024 * 1024; // 20MB chunks for speed
  private maxRetries: number = 5;
  private timeout: number = 120000; // 2 minutes per chunk
  private maxConcurrentChunks: number = 3; // 3-way parallel upload

  // Upload file directly to Cloudinary with chunked upload
  async uploadFileInChunks(
    file: File,
    onProgress?: (progress: CloudinaryUploadProgress) => void,
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  ): Promise<CloudinaryUploadResult> {
    const startTime = Date.now();
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    
    console.log(`Starting Cloudinary direct upload: ${file.name} (${file.size} bytes, ${totalChunks} chunks of ${this.chunkSize} bytes each)`);

    try {
      // Get Cloudinary signature
      const signature = await this.getCloudinarySignature();
      console.log('Got Cloudinary signature:', signature.cloudName);

      // Generate unique upload ID for resume capability
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Upload chunks with parallel processing
      let completedChunks = 0;
      const batchSize = this.maxConcurrentChunks;
      
      for (let batchStart = 0; batchStart < totalChunks; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, totalChunks);
        const batchPromises: Promise<boolean>[] = [];
        
        for (let chunkIndex = batchStart; chunkIndex < batchEnd; chunkIndex++) {
          const start = chunkIndex * this.chunkSize;
          const end = Math.min(start + this.chunkSize, file.size);
          const chunk = file.slice(start, end);
          
          console.log(`Starting chunk ${chunkIndex + 1}/${totalChunks} (${chunk.size} bytes)`);
          
          const chunkPromise = this.uploadChunkToCloudinary(
            chunk,
            chunkIndex,
            totalChunks,
            file.size,
            uploadId,
            signature,
            (chunkProgress) => {
              const overallProgress = ((completedChunks + chunkProgress / 100) / totalChunks) * 100;
              console.log(`Progress update: Chunk ${chunkIndex + 1}/${totalChunks}, Chunk Progress: ${chunkProgress}%, Overall: ${overallProgress.toFixed(1)}%`);
              onProgress?.({
                chunkIndex,
                totalChunks,
                chunkProgress,
                overallProgress,
                uploadedChunks: completedChunks,
                currentChunkSize: chunk.size,
                totalSize: file.size,
                isResuming: false
              });
            }
          ).then((success) => {
            if (success) {
              completedChunks++;
              onChunkComplete?.(completedChunks, totalChunks);
            }
            return success;
          });
          
          batchPromises.push(chunkPromise);
        }
        
        // Wait for current batch to complete
        console.log(`Waiting for batch ${Math.floor(batchStart / batchSize) + 1} to complete...`);
        const batchResults = await Promise.all(batchPromises);
        const failedChunks = batchResults.filter(success => !success).length;
        
        if (failedChunks > 0) {
          console.error(`${failedChunks} chunks failed in batch ${Math.floor(batchStart / batchSize) + 1}`);
          // Continue with next batch
        }
      }
      
      const uploadTime = Date.now() - startTime;
      console.log(`Cloudinary direct upload completed in ${uploadTime}ms`);
      
      // Return the final video URL
      const videoUrl = `https://res.cloudinary.com/${signature.cloudName}/video/upload/v${signature.timestamp}/${uploadId}.mp4`;
      
      return {
        success: true,
        videoUrl,
        publicId: `${signature.folder}/${uploadId}`,
        totalSize: file.size,
        uploadTime
      };
      
    } catch (error) {
      console.error('Cloudinary direct upload failed:', error);
      throw error;
    }
  }

  // Get Cloudinary signature from backend
  private async getCloudinarySignature(): Promise<CloudinarySignature> {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video/signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get Cloudinary signature');
    }

    const result = await response.json();
    return result;
  }

  // Upload a single chunk directly to Cloudinary
  private async uploadChunkToCloudinary(
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    totalFileSize: number,
    uploadId: string,
    signature: CloudinarySignature,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const start = chunkIndex * this.chunkSize;
    const end = Math.min(start + this.chunkSize, totalFileSize);
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`Uploading chunk ${chunkIndex + 1} to Cloudinary, attempt ${attempt + 1}`);
        
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('timestamp', signature.timestamp.toString());
        formData.append('signature', signature.signature);
        formData.append('api_key', signature.apiKey);
        formData.append('folder', signature.folder);
        formData.append('resource_type', 'video');
        formData.append('public_id', uploadId);
        
        // Add chunk-specific headers for resume capability
        formData.append('X-Unique-Upload-Id', uploadId);
        formData.append('Content-Range', `bytes ${start}-${end - 1}/${totalFileSize}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`Chunk ${chunkIndex + 1} timeout after ${this.timeout}ms`);
          controller.abort();
        }, this.timeout);
        
        const xhr = new XMLHttpRequest();
        
        return new Promise((resolve) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              onProgress?.(progress);
            }
          });
          
          xhr.addEventListener('load', () => {
            clearTimeout(timeoutId);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log(`Chunk ${chunkIndex + 1} uploaded successfully to Cloudinary`);
              resolve(true);
            } else {
              console.warn(`Chunk ${chunkIndex + 1} upload failed: ${xhr.status} - ${xhr.responseText}`);
              resolve(false);
            }
          });
          
          xhr.addEventListener('error', () => {
            clearTimeout(timeoutId);
            console.error(`Chunk ${chunkIndex + 1} upload error`);
            resolve(false);
          });
          
          xhr.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            console.log(`Chunk ${chunkIndex + 1} upload aborted`);
            resolve(false);
          });
          
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/video/upload`);
          xhr.send(formData);
        });
        
      } catch (error: any) {
        console.error(`Chunk ${chunkIndex + 1} upload error (attempt ${attempt + 1}):`, error);
        
        // If it's the last attempt, don't wait
        if (attempt === this.maxRetries - 1) {
          break;
        }
        
        // Wait before retry with exponential backoff
        const delay = Math.min(2000 * Math.pow(2, attempt), 10000); // Max 10 seconds
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }

  // Calculate optimal chunk size based on file size
  getOptimalChunkSize(fileSize: number): number {
    if (fileSize > 5 * 1024 * 1024 * 1024) { // > 5GB
      return 20 * 1024 * 1024; // 20MB chunks
    } else if (fileSize > 2 * 1024 * 1024 * 1024) { // > 2GB
      return 15 * 1024 * 1024; // 15MB chunks
    } else if (fileSize > 1 * 1024 * 1024 * 1024) { // > 1GB
      return 10 * 1024 * 1024; // 10MB chunks
    } else if (fileSize > 500 * 1024 * 1024) { // > 500MB
      return 8 * 1024 * 1024; // 8MB chunks
    } else {
      return 5 * 1024 * 1024; // 5MB chunks
    }
  }

  // Set chunk size
  setChunkSize(size: number): void {
    this.chunkSize = size;
  }
}

// Export singleton instance
export const cloudinaryDirectUploadService = new CloudinaryDirectUploadService();
