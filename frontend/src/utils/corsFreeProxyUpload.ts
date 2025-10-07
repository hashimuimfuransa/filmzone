// CORS-free proxy upload service
// Uploads through backend proxy to avoid CORS issues

export interface ProxyUploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export interface ProxyUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

class CORSFreeProxyUploadService {
  // Upload file through backend proxy (CORS-free)
  async uploadFile(
    file: File,
    onProgress?: (progress: ProxyUploadProgress) => void
  ): Promise<ProxyUploadResult> {
    const startTime = Date.now();
    
    console.log(`Starting CORS-free proxy upload: ${file.name} (${file.size} bytes)`);

    try {
      // Upload through backend proxy
      const result = await this.uploadThroughProxy(file, onProgress);
      
      const uploadTime = Date.now() - startTime;
      console.log(`CORS-free proxy upload completed in ${uploadTime}ms`);
      
      return {
        success: true,
        videoUrl: result.url,
        publicId: result.publicId,
        totalSize: file.size,
        uploadTime
      };
      
    } catch (error) {
      console.error('CORS-free proxy upload failed:', error);
      throw error;
    }
  }

  // Upload file through backend proxy with real progress tracking
  private async uploadThroughProxy(
    file: File,
    onProgress?: (progress: ProxyUploadProgress) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          console.log(`Proxy upload progress: ${percentage}% (${event.loaded}/${event.total} bytes)`);
          onProgress?.({
            percentage,
            loaded: event.loaded,
            total: event.total
          });
        }
      });
      
      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            console.log('Proxy upload completed:', result.url);
            resolve(result);
          } catch (error) {
            console.error('Error parsing proxy upload response:', error);
            reject(new Error('Invalid response from server'));
          }
        } else {
          console.error('Proxy upload failed:', xhr.status, xhr.statusText);
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      });
      
      // Handle upload errors
      xhr.addEventListener('error', () => {
        console.error('Proxy upload error occurred');
        reject(new Error('Upload failed due to network error'));
      });
      
      // Handle upload timeout
      xhr.addEventListener('timeout', () => {
        console.error('Proxy upload timeout');
        reject(new Error('Upload timeout'));
      });
      
      // Configure request
      xhr.open('POST', `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api'}/movies/upload/video/proxy`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      
      // Set timeout to 30 minutes for large files
      xhr.timeout = 30 * 60 * 1000;
      
      // Start upload
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const corsFreeProxyUploadService = new CORSFreeProxyUploadService();
