// Chunked upload service for large files
// This breaks large files into smaller chunks for faster, more reliable uploads

export interface ChunkUploadOptions {
  chunkSize: number; // Size of each chunk in bytes
  maxRetries: number; // Maximum retry attempts per chunk
  timeout: number; // Timeout per chunk in milliseconds
}

export interface ChunkUploadProgress {
  chunkIndex: number;
  totalChunks: number;
  chunkProgress: number;
  overallProgress: number;
  uploadedChunks: number;
}

export interface ChunkUploadResult {
  success: boolean;
  videoUrl: string;
  totalSize: number;
  uploadTime: number;
}

class ChunkedUploadService {
  private defaultOptions: ChunkUploadOptions = {
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    maxRetries: 3,
    timeout: 30000 // 30 seconds per chunk
  };

  // Upload file in chunks
  async uploadFileInChunks(
    file: File,
    uploadUrl: string,
    options: Partial<ChunkUploadOptions> = {},
    onProgress?: (progress: ChunkUploadProgress) => void,
    onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  ): Promise<ChunkUploadResult> {
    const opts = { ...this.defaultOptions, ...options };
    const totalChunks = Math.ceil(file.size / opts.chunkSize);
    const startTime = Date.now();
    
    console.log(`Starting chunked upload: ${file.name} (${file.size} bytes, ${totalChunks} chunks)`);

    try {
      // Upload chunks sequentially to avoid overwhelming the server
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * opts.chunkSize;
        const end = Math.min(start + opts.chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (${chunk.size} bytes)`);
        
        const success = await this.uploadChunk(
          chunk,
          chunkIndex,
          totalChunks,
          uploadUrl,
          opts,
          (chunkProgress) => {
            const overallProgress = ((chunkIndex + chunkProgress / 100) / totalChunks) * 100;
            onProgress?.({
              chunkIndex,
              totalChunks,
              chunkProgress,
              overallProgress,
              uploadedChunks: chunkIndex
            });
          }
        );
        
        if (!success) {
          throw new Error(`Failed to upload chunk ${chunkIndex + 1}`);
        }
        
        onChunkComplete?.(chunkIndex + 1, totalChunks);
      }
      
      const uploadTime = Date.now() - startTime;
      console.log(`Chunked upload completed in ${uploadTime}ms`);
      
      // Return the final video URL (you'll need to implement this on the backend)
      return {
        success: true,
        videoUrl: `${uploadUrl}/complete`, // Backend should provide the final URL
        totalSize: file.size,
        uploadTime
      };
      
    } catch (error) {
      console.error('Chunked upload failed:', error);
      throw error;
    }
  }

  // Upload a single chunk with retry logic
  private async uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    uploadUrl: string,
    options: ChunkUploadOptions,
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('chunkSize', chunk.size.toString());

    for (let attempt = 0; attempt < options.maxRetries; attempt++) {
      try {
        console.log(`Uploading chunk ${chunkIndex + 1}, attempt ${attempt + 1}`);
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          console.log(`Chunk ${chunkIndex + 1} uploaded successfully`);
          return true;
        } else {
          const errorText = await response.text();
          console.warn(`Chunk ${chunkIndex + 1} upload failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error(`Chunk ${chunkIndex + 1} upload error (attempt ${attempt + 1}):`, error);
      }
      
      // Wait before retry
      if (attempt < options.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    
    return false;
  }

  // Calculate optimal chunk size based on file size
  getOptimalChunkSize(fileSize: number): number {
    if (fileSize > 2 * 1024 * 1024 * 1024) { // > 2GB
      return 2 * 1024 * 1024; // 2MB chunks
    } else if (fileSize > 1 * 1024 * 1024 * 1024) { // > 1GB
      return 5 * 1024 * 1024; // 5MB chunks
    } else if (fileSize > 500 * 1024 * 1024) { // > 500MB
      return 10 * 1024 * 1024; // 10MB chunks
    } else {
      return 20 * 1024 * 1024; // 20MB chunks
    }
  }
}

// Export singleton instance
export const chunkedUploadService = new ChunkedUploadService();
