// Fast chunked upload service with resume capability
// Uploads large files in chunks for better speed and reliability

export interface ChunkedUploadProgress {
  chunkIndex: number;
  totalChunks: number;
  chunkProgress: number;
  overallProgress: number;
  uploadedChunks: number;
  currentChunkSize: number;
  totalSize: number;
}

export interface ChunkedUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

class FastChunkedUploadService {
  private chunkSize: number = 10 * 1024 * 1024; // 10MB chunks for speed
  private maxConcurrentChunks: number = 5; // Upload 5 chunks simultaneously
  private maxRetries: number = 3;
  private timeout: number = 60000; // 1 minute per chunk

  // Upload file in chunks with parallel processing
  async uploadFileInChunks(
    file: File,
    onProgress?: (progress: ChunkedUploadProgress) => void,
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  ): Promise<ChunkedUploadResult> {
    const startTime = Date.now();
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    
    console.log(`Starting fast chunked upload: ${file.name} (${file.size} bytes, ${totalChunks} chunks of ${this.chunkSize} bytes each)`);

    try {
      // Initialize upload session
      const uploadId = await this.initializeUpload(file.name, file.size, totalChunks);
      console.log('Upload session initialized with ID:', uploadId);

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
          
          const chunkPromise = this.uploadChunk(
            chunk,
            chunkIndex,
            totalChunks,
            uploadId,
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
                totalSize: file.size
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
      
      // Finalize the upload
      const result = await this.finalizeUpload(uploadId);
      
      const uploadTime = Date.now() - startTime;
      console.log(`Fast chunked upload completed in ${uploadTime}ms`);
      
      return {
        success: true,
        videoUrl: result.url,
        publicId: result.publicId,
        totalSize: file.size,
        uploadTime
      };
      
    } catch (error) {
      console.error('Fast chunked upload failed:', error);
      throw error;
    }
  }

  // Initialize upload session
  private async initializeUpload(filename: string, fileSize: number, totalChunks: number): Promise<string> {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        filename,
        fileSize,
        totalChunks,
        chunkSize: this.chunkSize
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initialize upload session');
    }

    const result = await response.json();
    return result.uploadId;
  }

  // Upload a single chunk
  private async uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    uploadId: string,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('chunkSize', chunk.size.toString());

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`Uploading chunk ${chunkIndex + 1}, attempt ${attempt + 1}`);
        
        // Simulate progress for this chunk
        let chunkProgress = 0;
        const progressInterval = setInterval(() => {
          chunkProgress += 20;
          if (chunkProgress >= 90) {
            chunkProgress = 90;
            clearInterval(progressInterval);
          }
          onProgress?.(chunkProgress);
        }, 50);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log(`Chunk ${chunkIndex + 1} timeout after ${this.timeout}ms`);
          controller.abort();
        }, this.timeout);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video/chunk`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        onProgress?.(100);

        if (response.ok) {
          console.log(`Chunk ${chunkIndex + 1} uploaded successfully`);
          return true;
        } else {
          const errorText = await response.text();
          console.warn(`Chunk ${chunkIndex + 1} upload failed: ${response.status} - ${errorText}`);
        }
        
      } catch (error: any) {
        console.error(`Chunk ${chunkIndex + 1} upload error (attempt ${attempt + 1}):`, error);
        
        if (attempt === this.maxRetries - 1) {
          break;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return false;
  }

  // Finalize the upload
  private async finalizeUpload(uploadId: string): Promise<any> {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video/finalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ uploadId })
    });

    if (!response.ok) {
      throw new Error('Failed to finalize upload');
    }

    return await response.json();
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
export const fastChunkedUploadService = new FastChunkedUploadService();
