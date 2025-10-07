// Simple streaming upload service - bypasses chunking for reliability
// This uploads the entire file at once but uses streaming to prevent memory issues

export interface StreamingUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StreamingUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

class SimpleStreamingUploadService {
  private timeout: number = 60 * 60 * 1000; // 1 hour timeout

  // Upload file using simple streaming approach
  async uploadFile(
    file: File,
    onProgress?: (progress: StreamingUploadProgress) => void
  ): Promise<StreamingUploadResult> {
    const startTime = Date.now();
    
    console.log(`Starting simple streaming upload: ${file.name} (${file.size} bytes)`);

    try {
      const formData = new FormData();
      formData.append('video', file);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = (event.loaded / event.total) * 100;
            console.log(`Streaming upload progress: ${percentage.toFixed(1)}% (${event.loaded}/${event.total} bytes)`);
            
            onProgress?.({
              loaded: event.loaded,
              total: event.total,
              percentage: percentage
            });
          }
        });

        // Track download progress (server response)
        xhr.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = (event.loaded / event.total) * 100;
            console.log(`Server response progress: ${percentage.toFixed(1)}%`);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result = JSON.parse(xhr.responseText);
              const uploadTime = Date.now() - startTime;
              
              console.log(`Simple streaming upload completed in ${uploadTime}ms`);
              
              resolve({
                success: true,
                videoUrl: result.url,
                publicId: result.publicId,
                totalSize: file.size,
                uploadTime
              });
            } catch (parseError) {
              console.error('Failed to parse response:', parseError);
              reject(new Error('Invalid response from server'));
            }
          } else {
            console.error(`Upload failed with status: ${xhr.status}`);
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          console.error('Upload error:', xhr.statusText);
          reject(new Error('Network error during upload'));
        });

        // Handle timeout
        xhr.addEventListener('timeout', () => {
          console.error('Upload timeout');
          reject(new Error('Upload timeout'));
        });

        // Configure request
        xhr.timeout = this.timeout;
        xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/movies/upload/video/stream`);
        
        // Add authorization header
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        // Start upload
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Simple streaming upload failed:', error);
      throw error;
    }
  }

  // Set timeout
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

// Export singleton instance
export const simpleStreamingUploadService = new SimpleStreamingUploadService();
