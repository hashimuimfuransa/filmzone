import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { moviesAPI } from '../services/api';
import { simpleVideoCompressionService, CompressionOptions } from '../utils/simpleVideoCompression';
import { simpleStreamingUploadService, StreamingUploadProgress } from '../utils/simpleStreamingUpload'; // Using simple streaming upload

interface VideoUploadNewProps {
  onUploadComplete: (file: File, videoUrl: string) => void;
  onUploadError: (error: string) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

interface UploadState {
  file: File | null;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  success: boolean;
  videoUrl: string | null;
  isCompressing: boolean;
  compressionProgress: number;
  compressedFile: File | null;
  compressionResult: {
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
  } | null;
}

const VideoUploadNew: React.FC<VideoUploadNewProps> = ({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  onUploadProgress,
  maxSizeMB = 5000, // 5GB default
  acceptedFormats = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'],
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    success: false,
    videoUrl: null,
    isCompressing: false,
    compressionProgress: 0,
    compressedFile: null,
    compressionResult: null,
  });

  const [compressionProfile, setCompressionProfile] = useState<string>('auto');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoInfo = useCallback(async (file: File): Promise<any> => {
    try {
      return await simpleVideoCompressionService.getVideoInfo(file);
    } catch (error) {
      console.error('Error getting video info:', error);
      throw error;
    }
  }, []);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) return;

    // Reset state
    setUploadState({
      file: null,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      success: false,
      videoUrl: null,
      isCompressing: false,
      compressionProgress: 0,
      compressedFile: null,
      compressionResult: null,
    });

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        error: language === 'kin' 
          ? `Dosiye ni nini. Ingano nini cyane ni ${maxSizeMB}MB`
          : `File is too large. Maximum size is ${maxSizeMB}MB`
      }));
      return;
    }

    // Validate file format
    if (!acceptedFormats.includes(file.type)) {
      setUploadState(prev => ({
        ...prev,
        error: language === 'kin'
          ? 'Ubwoko bw\'idosiye ntibyemewe'
          : 'File format not supported'
      }));
      return;
    }

    try {
      console.log('Getting video info...');
      const videoInfo = await getVideoInfo(file);
      console.log('Video info:', videoInfo);
      
      setUploadState(prev => ({
        ...prev,
        file,
        error: null,
      }));

      // Auto-compress very large files (>500MB)
      if (file.size > 500 * 1024 * 1024) {
        console.log('Large file detected, starting auto-compression...');
        setTimeout(() => compressVideo(file), 1000); // Small delay to show file info first
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setUploadState(prev => ({
        ...prev,
        error: language === 'kin'
          ? 'Ntibyashoboka gusoma dosiye'
          : 'Failed to read file'
      }));
    }
  }, [maxSizeMB, acceptedFormats, language]);

  const compressVideo = useCallback(async (file: File) => {
    if (!file) return;

    try {
      console.log('Starting video compression...');
      // Fast-path: skip compression for files > 1GB and proceed to upload (chunked)
      if (file.size > 1024 * 1024 * 1024) {
        console.log('File >1GB, skipping compression and proceeding to upload with chunking');
        setUploadState(prev => ({
          ...prev,
          isCompressing: false,
          compressionProgress: 0,
          compressedFile: null,
        }));
        return;
      }

      setUploadState(prev => ({
        ...prev,
        isCompressing: true,
        compressionProgress: 0,
        error: null,
      }));

      // Get compression options based on profile
      let compressionOptions: CompressionOptions;
      const profiles = simpleVideoCompressionService.getCompressionProfiles();
      
      if (compressionProfile === 'auto') {
        compressionOptions = simpleVideoCompressionService.getAutoCompressionProfile(file.size);
      } else {
        compressionOptions = profiles[compressionProfile as keyof typeof profiles] || profiles.medium;
      }

      console.log('Compression options:', compressionOptions);

      // Add a 30s timeout fallback: if compression not finished, proceed without it
      const compressionPromise = simpleVideoCompressionService.compressVideo(
        file,
        compressionOptions,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            compressionProgress: progress,
          }));
        }
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Compression timeout')), 30000);
      });

      const result = await Promise.race([compressionPromise, timeoutPromise]);

      console.log('Compression completed:', result);

      setUploadState(prev => ({
        ...prev,
        isCompressing: false,
        compressionProgress: 100,
        compressedFile: result.compressedFile,
        compressionResult: {
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
        },
      }));

    } catch (error) {
      console.error('Compression failed or timed out:', error);
      // Fallback: continue without compression
      setUploadState(prev => ({
        ...prev,
        isCompressing: false,
        compressedFile: null,
        compressionProgress: 0,
      }));
    }
  }, [compressionProfile, language]);

  const uploadVideo = useCallback(async () => {
    const fileToUpload = uploadState.compressedFile || uploadState.file;
    if (!fileToUpload) {
      console.log('No file to upload');
      return;
    }

    try {
      console.log('Starting video upload...', {
        fileName: fileToUpload.name,
        fileSize: fileToUpload.size,
        isCompressed: !!uploadState.compressedFile
      });
      
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
        success: false,
      }));

      // Notify parent component that upload started
      if (onUploadStart) {
        onUploadStart();
      }

          // Use simple streaming upload - more reliable for large files
          console.log(`Starting simple streaming upload: ${fileToUpload.name} (${fileToUpload.size} bytes)`);
          
          const result = await simpleStreamingUploadService.uploadFile(
            fileToUpload,
            (progress: StreamingUploadProgress) => {
              console.log(`Simple streaming upload progress: ${progress.percentage.toFixed(1)}%`);
              console.log('Setting upload progress to:', progress.percentage);
              setUploadState(prev => {
                console.log('Previous upload progress:', prev.uploadProgress);
                return {
                  ...prev,
                  uploadProgress: progress.percentage,
                };
              });
              // Notify parent component of progress
              if (onUploadProgress) {
                console.log('Notifying parent of progress:', progress.percentage);
                onUploadProgress(progress.percentage);
              }
            }
          );

          console.log('Simple streaming upload completed:', result);
      const videoUrl = result.videoUrl;
      console.log('Video URL received:', videoUrl);
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
        success: true,
        videoUrl,
      }));

      // Notify parent component
      onUploadComplete(fileToUpload, videoUrl);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: language === 'kin'
          ? 'Ntibyashoboka kohereza dosiye'
          : errorMessage
      }));
      onUploadError(errorMessage);
    }
  }, [uploadState.file, uploadState.compressedFile, language, onUploadComplete, onUploadError, onUploadStart, onUploadProgress]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      uploadProgress: 0,
    }));
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      file: null,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      success: false,
      videoUrl: null,
      isCompressing: false,
      compressionProgress: 0,
      compressedFile: null,
      compressionResult: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card sx={{ p: 2, border: '2px dashed #ddd' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {language === 'kin' ? 'Kohereza Video' : 'Upload Video'}
        </Typography>

        {/* File Input */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            disabled={uploadState.isUploading}
            sx={{ mb: 2 }}
          >
            {language === 'kin' ? 'Hitamo Video' : 'Select Video'}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
            />
          </Button>
          
          <Typography variant="body2" color="text.secondary">
            {language === 'kin' 
              ? `Ubwoko bwemewe: ${acceptedFormats.join(', ')}`
              : `Supported formats: ${acceptedFormats.join(', ')}`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {language === 'kin' 
              ? `Ingano nini: ${maxSizeMB}MB`
              : `Maximum size: ${maxSizeMB}MB`
            }
          </Typography>
        </Box>

        {/* Error Display */}
        {uploadState.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadState.error}
          </Alert>
        )}

        {/* Success Display */}
        {uploadState.success && uploadState.videoUrl && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon />
              <Typography>
                {language === 'kin' ? 'Video ryashyizweho neza!' : 'Video uploaded successfully!'}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* File Information */}
        {uploadState.file && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'kin' ? 'Amakuru y\'idosiye' : 'File Information'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2">
                  <strong>{language === 'kin' ? 'Izina:' : 'Name:'}</strong> {uploadState.file.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>{language === 'kin' ? 'Ingano:' : 'Size:'}</strong> {formatFileSize(uploadState.file.size)}
                  </Typography>
                  {uploadState.file.size > 100 * 1024 * 1024 && (
                    <Chip 
                      label={language === 'kin' ? 'Dosiye ni nini' : 'Large file'} 
                      size="small" 
                      color="warning"
                    />
                  )}
                </Box>
              </Box>
              <Box>
                <Typography variant="body2">
                  <strong>{language === 'kin' ? 'Ubwoko:' : 'Type:'}</strong> {uploadState.file.type}
                </Typography>
                <Typography variant="body2">
                  <strong>{language === 'kin' ? 'Igihe cyohereza:' : 'Last modified:'}</strong> {new Date(uploadState.file.lastModified).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Compression Controls */}
        {uploadState.file && !uploadState.isCompressing && !uploadState.compressedFile && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {language === 'kin' ? 'Gukora Video' : 'Compress Video'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>{language === 'kin' ? 'Ubwoko' : 'Profile'}</InputLabel>
                <Select
                  value={compressionProfile}
                  onChange={(e) => setCompressionProfile(e.target.value)}
                  label={language === 'kin' ? 'Ubwoko' : 'Profile'}
                >
                  <MenuItem value="auto">{language === 'kin' ? 'Gukoresha ubwoko' : 'Auto'}</MenuItem>
                  <MenuItem value="high">{language === 'kin' ? 'Ubwoko bwiza' : 'High Quality'}</MenuItem>
                  <MenuItem value="medium">{language === 'kin' ? 'Ubwoko bwo hagati' : 'Medium Quality'}</MenuItem>
                  <MenuItem value="low">{language === 'kin' ? 'Ubwoko buke' : 'Low Quality'}</MenuItem>
                  <MenuItem value="ultra">{language === 'kin' ? 'Ubwoko buke cyane' : 'Ultra Compressed'}</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                onClick={() => compressVideo(uploadState.file!)}
                startIcon={<SettingsIcon />}
                disabled={uploadState.isUploading}
              >
                {language === 'kin' ? 'Gukora' : 'Compress'}
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {language === 'kin' 
                ? 'Gukora video bizagabanya ingano yayo kandi bizagira kohereza byihuse.'
                : 'Compressing video will reduce its size and make upload faster.'
              }
            </Typography>
          </Box>
        )}

        {/* Compression Progress */}
        {uploadState.isCompressing && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <SettingsIcon />
              <Typography variant="body2">
                {language === 'kin' ? 'Gukora video...' : 'Compressing video...'}
              </Typography>
              <Typography variant="body2">
                {uploadState.compressionProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadState.compressionProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Compression Result */}
        {uploadState.compressionResult && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon />
              <Box>
                <Typography variant="body2">
                  {language === 'kin' ? 'Video yakozwe neza!' : 'Video compressed successfully!'}
                </Typography>
                <Typography variant="body2">
                  {language === 'kin' 
                    ? `Ingano yabanje: ${formatFileSize(uploadState.compressionResult.originalSize)} → ${formatFileSize(uploadState.compressionResult.compressedSize)}`
                    : `Original: ${formatFileSize(uploadState.compressionResult.originalSize)} → Compressed: ${formatFileSize(uploadState.compressionResult.compressedSize)}`
                  }
                </Typography>
                <Typography variant="body2">
                  {language === 'kin' 
                    ? `Yagabanijwe na ${uploadState.compressionResult.compressionRatio}%`
                    : `Reduced by ${uploadState.compressionResult.compressionRatio}%`
                  }
                </Typography>
              </Box>
            </Box>
          </Alert>
        )}

        {/* Upload Progress */}
        {uploadState.isUploading && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2">
                {language === 'kin' ? 'Kohereza...' : 'Uploading...'}
              </Typography>
              <Typography variant="body2">
                {uploadState.uploadProgress.toFixed(1)}%
              </Typography>
              {uploadState.uploadProgress >= 100 && (
                <Typography variant="caption" color="info.main">
                  {language === 'kin' ? '(Gukora ku Cloudinary...)' : '(Processing on Cloudinary...)'}
                </Typography>
              )}
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadState.uploadProgress}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Action Buttons */}
        {uploadState.file && !uploadState.isUploading && !uploadState.isCompressing && !uploadState.success && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                console.log('Upload button clicked');
                uploadVideo();
              }}
              startIcon={<UploadIcon />}
            >
              {uploadState.compressedFile 
                ? (language === 'kin' ? 'Kohereza Video Yakozwe' : 'Upload Compressed Video')
                : (language === 'kin' ? 'Kohereza Video' : 'Upload Video')
              }
            </Button>
            
            <Button
              variant="outlined"
              onClick={resetUpload}
              startIcon={<CancelIcon />}
            >
              {language === 'kin' ? 'Kureka' : 'Cancel'}
            </Button>
          </Box>
        )}

        {/* Cancel Upload Button */}
        {uploadState.isUploading && (
          <Button
            variant="outlined"
            color="error"
            onClick={cancelUpload}
            startIcon={<CancelIcon />}
          >
            {language === 'kin' ? 'Kureka' : 'Cancel Upload'}
          </Button>
        )}

        {/* Cancel Compression Button */}
        {uploadState.isCompressing && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setUploadState(prev => ({ ...prev, isCompressing: false }))}
            startIcon={<CancelIcon />}
          >
            {language === 'kin' ? 'Kureka Gukora' : 'Cancel Compression'}
          </Button>
        )}

        {/* Reset Button */}
        {uploadState.success && (
          <Button
            variant="outlined"
            onClick={resetUpload}
            startIcon={<UploadIcon />}
          >
            {language === 'kin' ? 'Kohereza Icyindi' : 'Upload Another'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoUploadNew;
