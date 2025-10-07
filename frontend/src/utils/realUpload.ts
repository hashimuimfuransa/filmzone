// Real upload service with proper progress tracking
// This uses XMLHttpRequest for real upload progress instead of simulated progress

export interface RealUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface RealUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

class RealUploadService {
  
  // Upload file with real progress tracking
  async uploadFileWithProgress(
    file: File,
    onProgress?: (progress: RealUploadProgress) => void
  ): Promise<RealUploadResult> {
    const startTime = Date.now();
    
    console.log(`Starting real upload: ${file.name} (${file.size} bytes)`);

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentage}% (${event.loaded}/${event.total} bytes)`);
          
          onProgress?.({
            loaded: event.loaded,
            total: event.total,
            percentage: percentage
          });
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            const uploadTime = Date.now() - startTime;
            
            console.log(`Upload completed in ${uploadTime}ms:`, result.url);
            
            resolve({
              success: true,
              videoUrl: result.url,
              publicId: result.publicId,
              totalSize: file.size,
              uploadTime
            });
          } catch (error) {
            console.error('Error parsing upload response:', error);
            reject(new Error('Invalid response from server'));
          }
        } else {
          console.error('Upload failed:', xhr.status, xhr.statusText);
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });

      // Handle upload errors
      xhr.addEventListener('error', () => {
        console.error('Upload error occurred');
        reject(new Error('Upload failed due to network error'));
      });

      // Handle upload timeout
      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout');
        reject(new Error('Upload timeout'));
      });

      // Configure request
      xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      
      // Set timeout to 10 minutes for large files
      xhr.timeout = 10 * 60 * 1000;
      
      // Start upload
      xhr.send(formData);
    });
  }

  // Calculate estimated upload time based on file size
  estimateUploadTime(fileSize: number): number {
    // Rough estimate: 1MB per second (adjust based on your connection)
    return Math.max(fileSize / (1024 * 1024), 30); // Minimum 30 seconds
  }
}

// Export singleton instance
export const realUploadService = new RealUploadService();
