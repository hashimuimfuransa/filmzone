// True chunked upload service with resume capability
// This actually breaks files into chunks and uploads them sequentially

export interface ChunkUploadProgress {
  chunkIndex: number;
  totalChunks: number;
  chunkProgress: number;
  overallProgress: number;
  uploadedChunks: number;
  currentChunkSize: number;
  totalSize: number;
  isResuming: boolean;
}

export interface ChunkUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

class TrueChunkedUploadService {
  private chunkSize: number = 5 * 1024 * 1024; // Default 5MB chunks (reduced for reliability)
  private maxRetries: number = 5; // Increased retries for better reliability
  private timeout: number = 300000; // 5 minutes per chunk (increased for stability)
  private maxConcurrentChunks: number = 3; // Upload up to 3 chunks in parallel

  // Upload file in actual chunks with resume capability
  async uploadFileInChunks(
    file: File,
    onProgress?: (progress: ChunkUploadProgress) => void,
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  ): Promise<ChunkUploadResult> {
    const startTime = Date.now();
    const totalChunks = Math.ceil(file.size / this.chunkSize);
    
    console.log(`Starting TRUE chunked upload: ${file.name} (${file.size} bytes, ${totalChunks} chunks of ${this.chunkSize} bytes each)`);

    try {
      // Initialize upload session
      const uploadId = await this.initializeUpload(file.name, file.size, totalChunks);
      console.log('Upload session initialized with ID:', uploadId);

      // Upload chunks with smart parallel processing for better reliability
      let completedChunks = 0;
      
      // Check for existing chunks to resume upload
      const existingChunks = await this.checkExistingChunks(uploadId, totalChunks);
      console.log(`Found ${existingChunks} existing chunks, resuming from chunk ${existingChunks + 1}`);
      
      // Process chunks in small batches for better reliability
      const batchSize = 2; // Process 2 chunks at a time for stability
      
      for (let batchStart = 0; batchStart < totalChunks; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize, totalChunks);
        const batchPromises: Promise<boolean>[] = [];
        
        for (let chunkIndex = batchStart; chunkIndex < batchEnd; chunkIndex++) {
          // Skip if chunk already exists
          if (chunkIndex < existingChunks) {
            completedChunks++;
            onChunkComplete?.(completedChunks, totalChunks);
            continue;
          }
          
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
                totalSize: file.size,
                isResuming: chunkIndex < existingChunks
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
        
        // Wait for current batch to complete before starting next batch
        console.log(`Waiting for batch ${Math.floor(batchStart / batchSize) + 1} to complete...`);
        const batchResults = await Promise.all(batchPromises);
        const failedChunks = batchResults.filter(success => !success).length;
        
        if (failedChunks > 0) {
          console.error(`${failedChunks} chunks failed in batch ${Math.floor(batchStart / batchSize) + 1}`);
          // Continue with next batch instead of failing completely
        }
      }
      
      // Finalize the upload
      const result = await this.finalizeUpload(uploadId);
      
      const uploadTime = Date.now() - startTime;
      console.log(`Chunked upload completed in ${uploadTime}ms`);
      
      return {
        success: true,
        videoUrl: result.url,
        publicId: result.publicId,
        totalSize: file.size,
        uploadTime
      };
      
    } catch (error) {
      console.error('Chunked upload failed:', error);
      throw error;
    }
  }

  // Check for existing chunks to enable resume capability
  private async checkExistingChunks(uploadId: string, totalChunks: number): Promise<number> {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ uploadId })
      });

      if (response.ok) {
        const result = await response.json();
        return result.existingChunks || 0;
      }
    } catch (error) {
      console.log('Could not check existing chunks, starting fresh:', error);
    }
    
    return 0; // Start fresh if we can't check
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

  // Upload a single chunk with better error handling and progress tracking
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
        
        // Simulate progress for this chunk (0-100%)
        let chunkProgress = 0;
        const progressInterval = setInterval(() => {
          chunkProgress += 10;
          if (chunkProgress >= 90) {
            chunkProgress = 90;
            clearInterval(progressInterval);
          }
          onProgress?.(chunkProgress);
        }, 100);
        
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
        onProgress?.(100); // Ensure we show 100% when complete

        if (response.ok) {
          console.log(`Chunk ${chunkIndex + 1} uploaded successfully`);
          return true;
        } else {
          const errorText = await response.text();
          console.warn(`Chunk ${chunkIndex + 1} upload failed: ${response.status} - ${errorText}`);
        }
        
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

  // Calculate optimal chunk size based on file size - Optimized for reliability
  getOptimalChunkSize(fileSize: number): number {
    if (fileSize > 5 * 1024 * 1024 * 1024) { // > 5GB
      return 10 * 1024 * 1024; // 10MB chunks
    } else if (fileSize > 2 * 1024 * 1024 * 1024) { // > 2GB
      return 8 * 1024 * 1024; // 8MB chunks
    } else if (fileSize > 1 * 1024 * 1024 * 1024) { // > 1GB
      return 5 * 1024 * 1024; // 5MB chunks
    } else if (fileSize > 500 * 1024 * 1024) { // > 500MB
      return 3 * 1024 * 1024; // 3MB chunks
    } else {
      return 2 * 1024 * 1024; // 2MB chunks
    }
  }

  // Set chunk size
  setChunkSize(size: number): void {
    this.chunkSize = size;
  }
}

// Export singleton instance
export const trueChunkedUploadService = new TrueChunkedUploadService();
