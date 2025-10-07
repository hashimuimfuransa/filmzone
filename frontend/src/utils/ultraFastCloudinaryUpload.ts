// Ultra-fast Cloudinary direct upload service
// Uses unsigned upload with auto-upload for maximum speed

export interface FastUploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

export interface FastUploadResult {
  success: boolean;
  videoUrl: string;
  publicId: string;
  totalSize: number;
  uploadTime: number;
}

interface CloudinaryPreset {
  cloudName: string;
  uploadPreset: string;
  folder: string;
}

class UltraFastCloudinaryUploadService {
  // Upload file directly to Cloudinary with maximum speed
  async uploadFile(
    file: File,
    onProgress?: (progress: FastUploadProgress) => void
  ): Promise<FastUploadResult> {
    const startTime = Date.now();
    
    console.log(`Starting ultra-fast Cloudinary upload: ${file.name} (${file.size} bytes)`);

    try {
      // Get Cloudinary preset
      const preset = await this.getCloudinaryPreset();
      console.log('Got Cloudinary preset:', preset.cloudName);

      // Upload directly to Cloudinary using unsigned upload
      const result = await this.uploadToCloudinary(file, preset, onProgress);
      
      const uploadTime = Date.now() - startTime;
      console.log(`Ultra-fast upload completed in ${uploadTime}ms`);
      
      return {
        success: true,
        videoUrl: result.secure_url,
        publicId: result.public_id,
        totalSize: file.size,
        uploadTime
      };
      
    } catch (error) {
      console.error('Ultra-fast upload failed:', error);
      throw error;
    }
  }

  // Get Cloudinary preset from backend
  private async getCloudinaryPreset(): Promise<CloudinaryPreset> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/movies/upload/video/preset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get Cloudinary preset');
    }

    const result = await response.json();
    return result;
  }

  // Upload file directly to Cloudinary with real progress tracking
  private async uploadToCloudinary(
    file: File,
    preset: CloudinaryPreset,
    onProgress?: (progress: FastUploadProgress) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset.uploadPreset);
      formData.append('folder', preset.folder);
      formData.append('resource_type', 'video');
      formData.append('use_filename', 'true');
      formData.append('unique_filename', 'true');
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          console.log(`Upload progress: ${percentage}% (${event.loaded}/${event.total} bytes)`);
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
            console.log('Upload completed:', result.secure_url);
            resolve(result);
          } catch (error) {
            console.error('Error parsing upload response:', error);
            reject(new Error('Invalid response from Cloudinary'));
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
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${preset.cloudName}/video/upload`);
      
      // Set timeout to 30 minutes for large files
      xhr.timeout = 30 * 60 * 1000;
      
      // Start upload
      xhr.send(formData);
    });
  }
}

// Export singleton instance
export const ultraFastCloudinaryUploadService = new UltraFastCloudinaryUploadService();
