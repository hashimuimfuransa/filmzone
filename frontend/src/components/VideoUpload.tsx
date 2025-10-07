import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  LinearProgress,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { simpleVideoCompressionService, CompressionOptions, CompressionResult } from '../utils/simpleVideoCompression';
import { moviesAPI } from '../services/api';

interface VideoUploadProps {
  onUploadComplete: (file: File, videoUrl: string) => void;
  onUploadError: (error: string) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

interface UploadState {
  file: File | null;
  isCompressing: boolean;
  isUploading: boolean;
  compressionProgress: number;
  uploadProgress: number;
  error: string | null;
  compressedFile: File | null;
  videoInfo: any;
  compressionResult: CompressionResult | null;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  onUploadProgress,
  maxSizeMB = 1000, // 1GB default
  acceptedFormats = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'],
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    isCompressing: false,
    isUploading: false,
    compressionProgress: 0,
    uploadProgress: 0,
    error: null,
    compressedFile: null,
    videoInfo: null,
    compressionResult: null,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [compressionSettings, setCompressionSettings] = useState<CompressionOptions>({
    quality: 0.6,
    maxSizeMB: 500,
    maxWidth: 1920,
    maxHeight: 1080,
  });

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    if (!file) return;

    // Validate file size - Allow larger files as they will be compressed
    if (file.size > maxSizeMB * 1024 * 1024) {
      // Don't block large files, just warn that compression is needed
    }

    // Validate file format
    if (!acceptedFormats.includes(file.type)) {
      console.log('Invalid file format:', file.type);
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
      // Get video info using the service
      const videoInfo = await simpleVideoCompressionService.getVideoInfo(file);
      console.log('Video info:', videoInfo);
      
      setUploadState(prev => ({
        ...prev,
        file,
        videoInfo,
        error: null,
      }));

      // Auto-compress if file is large (lowered threshold for better compression)
      if (file.size > 50 * 1024 * 1024) { // 50MB threshold - compress most files
        console.log('File is large, starting compression...');
        await compressVideo(file);
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
    try {
      setUploadState(prev => ({
        ...prev,
        isCompressing: true,
        compressionProgress: 0,
        error: null,
      }));

      const result = await simpleVideoCompressionService.compressVideo(
        file,
        compressionSettings,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            compressionProgress: progress,
          }));
        }
      );

      setUploadState(prev => ({
        ...prev,
        isCompressing: false,
        compressionProgress: 100,
        compressedFile: result.compressedFile,
        compressionResult: result,
      }));
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isCompressing: false,
        error: language === 'kin'
          ? 'Ntibyashoboka gukora dosiye'
          : 'Failed to compress video'
      }));
    }
  }, [compressionSettings, language]);

  const uploadVideo = useCallback(async () => {
    const fileToUpload = uploadState.compressedFile || uploadState.file;
    console.log('Upload video clicked, file:', fileToUpload);
    if (!fileToUpload) {
      console.log('No file to upload');
      return;
    }

    try {
      console.log('Starting video upload...');
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }));

      // Notify parent component that upload started
      if (onUploadStart) {
        onUploadStart();
      }

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      const formData = new FormData();
      formData.append('video', fileToUpload);
      console.log('FormData created, file size:', fileToUpload.size);

      // Use actual API with progress tracking
      console.log('Calling moviesAPI.uploadVideo...');
      const response = await moviesAPI.uploadVideo(formData, {
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadState(prev => ({
              ...prev,
              uploadProgress: progress,
            }));
            // Notify parent component of progress
            if (onUploadProgress) {
              onUploadProgress(progress);
            }
          }
        },
        signal: abortControllerRef.current?.signal,
      });

      console.log('Upload response:', response.data);
      const videoUrl = response.data.url;
      console.log('Video URL received:', videoUrl);
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        uploadProgress: 100,
      }));

      onUploadComplete(fileToUpload, videoUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: language === 'kin'
          ? 'Ntibyashoboka kohereza dosiye'
          : 'Failed to upload video'
      }));
      onUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [uploadState.compressedFile, uploadState.file, language, onUploadComplete, onUploadError, onUploadStart, onUploadProgress]);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploadState(prev => ({
      ...prev,
      isUploading: false,
      isCompressing: false,
      uploadProgress: 0,
      compressionProgress: 0,
    }));
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      file: null,
      isCompressing: false,
      isUploading: false,
      compressionProgress: 0,
      uploadProgress: 0,
      error: null,
      compressedFile: null,
      videoInfo: null,
      compressionResult: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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



  return (
    <Box>
      {/* File Selection */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState.isCompressing || uploadState.isUploading}
            >
              {language === 'kin' ? 'Hitamo Video' : 'Select Video'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
            >
              {language === 'kin' ? 'Amahitamo' : 'Settings'}
            </Button>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* File Info */}
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
                    {uploadState.file.size > 50 * 1024 * 1024 && (
                      <Chip 
                        label={language === 'kin' ? 'Rizakozwa' : 'Will compress'} 
                        size="small" 
                        color="warning"
                      />
                    )}
                  </Box>
                </Box>
                <Box>
                  {uploadState.videoInfo && (
                    <>
                      <Typography variant="body2">
                        <strong>{language === 'kin' ? 'Igihe:' : 'Duration:'}</strong> {formatDuration(uploadState.videoInfo.duration)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{language === 'kin' ? 'Uburebure:' : 'Resolution:'}</strong> {uploadState.videoInfo.width}x{uploadState.videoInfo.height}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Compression Status */}
          {uploadState.isCompressing && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">
                  {language === 'kin' ? 'Gukora dosiye...' : 'Compressing video...'}
                </Typography>
                <Chip label={`${uploadState.compressionProgress}%`} size="small" />
              </Box>
              <LinearProgress variant="determinate" value={uploadState.compressionProgress} />
            </Box>
          )}

          {/* Compression Result */}
          {uploadState.compressionResult && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="success" sx={{ mb: 1 }}>
                {language === 'kin' 
                  ? `Dosiye yakozwe neza! Yagabanijwe na ${uploadState.compressionResult.compressionRatio.toFixed(1)}%`
                  : `Video compressed successfully! Reduced by ${uploadState.compressionResult.compressionRatio.toFixed(1)}%`
                }
              </Alert>
              <Typography variant="body2" color="text.secondary">
                {language === 'kin' 
                  ? `Ingano yabanje: ${formatFileSize(uploadState.compressionResult.originalSize)} → ${formatFileSize(uploadState.compressionResult.compressedSize)}`
                  : `Size: ${formatFileSize(uploadState.compressionResult.originalSize)} → ${formatFileSize(uploadState.compressionResult.compressedSize)}`
                }
              </Typography>
            </Box>
          )}

          {/* Upload Progress */}
          {uploadState.isUploading && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2">
                  {language === 'kin' ? 'Kohereza dosiye...' : 'Uploading video...'}
                </Typography>
                <Chip label={`${uploadState.uploadProgress}%`} size="small" />
              </Box>
              <LinearProgress variant="determinate" value={uploadState.uploadProgress} />
            </Box>
          )}

          {/* Error Display */}
          {uploadState.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadState.error}
            </Alert>
          )}

          {/* Action Buttons */}
          {uploadState.file && !uploadState.isCompressing && !uploadState.isUploading && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => {
                  console.log('Upload button clicked');
                  uploadVideo();
                }}
                startIcon={<UploadIcon />}
              >
                {language === 'kin' ? 'Kohereza' : 'Upload'}
              </Button>
              
              {uploadState.file.size > 100 * 1024 * 1024 && !uploadState.compressedFile && (
                <Button
                  variant="outlined"
                  onClick={() => compressVideo(uploadState.file!)}
                  startIcon={<SettingsIcon />}
                >
                  {language === 'kin' ? 'Gukora' : 'Compress'}
                </Button>
              )}
              
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
          {(uploadState.isCompressing || uploadState.isUploading) && (
            <Button
              variant="outlined"
              color="error"
              onClick={cancelUpload}
              startIcon={<CancelIcon />}
            >
              {language === 'kin' ? 'Kureka' : 'Cancel'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Compression Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {language === 'kin' ? 'Amahitamo yo Gukora' : 'Compression Settings'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>{language === 'kin' ? 'Ubwiza' : 'Quality'}</InputLabel>
              <Select
                value={compressionSettings.quality}
                onChange={(e) => setCompressionSettings(prev => ({ ...prev, quality: Number(e.target.value) }))}
              >
                <MenuItem value={0.3}>{language === 'kin' ? 'Hasi' : 'Low'}</MenuItem>
                <MenuItem value={0.6}>{language === 'kin' ? 'Hagati' : 'Medium'}</MenuItem>
                <MenuItem value={0.8}>{language === 'kin' ? 'Hejuru' : 'High'}</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>
                {language === 'kin' ? 'Ingano y\'ingenzi (MB)' : 'Maximum Size (MB)'}
              </Typography>
              <Slider
                value={compressionSettings.maxSizeMB}
                onChange={(_, value) => setCompressionSettings(prev => ({ ...prev, maxSizeMB: value as number }))}
                min={50}
                max={2000}
                step={50}
                marks={[
                  { value: 100, label: '100MB' },
                  { value: 500, label: '500MB' },
                  { value: 1000, label: '1GB' },
                ]}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{language === 'kin' ? 'Ubugari' : 'Width'}</InputLabel>
                <Select
                  value={compressionSettings.maxWidth}
                  onChange={(e) => setCompressionSettings(prev => ({ ...prev, maxWidth: e.target.value as number }))}
                >
                  <MenuItem value={1280}>1280px</MenuItem>
                  <MenuItem value={1920}>1920px</MenuItem>
                  <MenuItem value={2560}>2560px</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>{language === 'kin' ? 'Uburebure' : 'Height'}</InputLabel>
                <Select
                  value={compressionSettings.maxHeight}
                  onChange={(e) => setCompressionSettings(prev => ({ ...prev, maxHeight: e.target.value as number }))}
                >
                  <MenuItem value={720}>720px</MenuItem>
                  <MenuItem value={1080}>1080px</MenuItem>
                  <MenuItem value={1440}>1440px</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            {language === 'kin' ? 'Kureka' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={() => setSettingsOpen(false)}>
            {language === 'kin' ? 'Bika' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoUpload;
