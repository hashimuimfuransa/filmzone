import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Pagination,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Fab,
  Backdrop,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../../contexts/LanguageContext';
import { moviesAPI, categoriesAPI, dubbersAPI } from '../../services/api';
import VideoUploadNew from '../../components/VideoUploadNew';

interface Movie {
  _id: string;
  titleEn: string;
  titleKin: string;
  descriptionEn: string;
  descriptionKin: string;
  year: number;
  durationMinutes: number;
  posterUrl?: string;
  trailerYoutubeUrl?: string;
  videoUrl?: string;
  isDubbed: boolean;
  dubberId?: {
    _id: string;
    name: string;
  };
  categories: Array<{
    _id: string;
    nameEn: string;
    nameKin: string;
  }>;
  views: number;
  rating: number;
  season?: number;
  episode?: number;
  languages: string[];
}

interface Category {
  _id: string;
  nameEn: string;
  nameKin: string;
}

interface Dubber {
  _id: string;
  name: string;
}

const AdminMovies: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useLanguage();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dubbers, setDubbers] = useState<Dubber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    titleEn: '',
    titleKin: '',
    descriptionEn: '',
    descriptionKin: '',
    year: new Date().getFullYear(),
    durationMinutes: 90,
    posterUrl: '',
    trailerYoutubeUrl: '',
    videoUrl: '',
    isDubbed: false,
    dubberId: '',
    categories: [] as string[],
    season: '',
    episode: '',
    languages: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [moviesResponse, categoriesResponse, dubbersResponse] =
        await Promise.all([
          moviesAPI.getMovies({ page: currentPage, limit: 20 }),
          categoriesAPI.getCategories(),
          dubbersAPI.getDubbers(),
        ]);

      setMovies(moviesResponse.data.movies);
      setTotalPages(moviesResponse.data.pagination.totalPages);
      setCategories(categoriesResponse.data.categories);
      setDubbers(dubbersResponse.data.dubbers);
      
      console.log('Loaded categories:', categoriesResponse.data.categories);
      console.log('Loaded dubbers:', dubbersResponse.data.dubbers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (movie?: Movie) => {
    if (movie) {
      console.log('Opening dialog for movie:', movie);
      console.log('Movie categories:', movie.categories);
      setEditingMovie(movie);
      setFormData({
        titleEn: movie.titleEn,
        titleKin: movie.titleKin,
        descriptionEn: movie.descriptionEn,
        descriptionKin: movie.descriptionKin,
        year: movie.year,
        durationMinutes: movie.durationMinutes,
        posterUrl: movie.posterUrl || '',
        trailerYoutubeUrl: movie.trailerYoutubeUrl || '',
        videoUrl: movie.videoUrl || '',
        isDubbed: movie.isDubbed,
        dubberId: movie.dubberId?._id || '',
        categories: movie.categories.map(cat => cat._id),
        season: movie.season?.toString() || '',
        episode: movie.episode?.toString() || '',
        languages: movie.languages || [],
      });
    } else {
      console.log('Opening dialog for new movie');
      setEditingMovie(null);
      setFormData({
        titleEn: '',
        titleKin: '',
        descriptionEn: '',
        descriptionKin: '',
        year: new Date().getFullYear(),
        durationMinutes: 90,
        posterUrl: '',
        trailerYoutubeUrl: '',
        videoUrl: '',
        isDubbed: false,
        dubberId: '',
        categories: [],
        season: '',
        episode: '',
        languages: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMovie(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      console.log('Saving movie...', formData);
      console.log('Categories being saved:', formData.categories);
      console.log('Video URL in form data:', formData.videoUrl);
      
      const movieData = {
        ...formData,
        season: formData.season ? parseInt(formData.season) : undefined,
        episode: formData.episode ? parseInt(formData.episode) : undefined,
        // Clean up empty strings for optional fields
        posterUrl: formData.posterUrl || undefined,
        trailerYoutubeUrl: formData.trailerYoutubeUrl || undefined,
        videoUrl: formData.videoUrl || undefined, // Backend now handles null/empty values properly
        dubberId: formData.dubberId || undefined,
        categories: formData.categories.length > 0 ? formData.categories : undefined,
        languages: formData.languages.length > 0 ? formData.languages : undefined,
      };
      
      console.log('Final movie data:', movieData);

      if (editingMovie) {
        console.log('Updating movie:', editingMovie._id);
        await moviesAPI.updateMovie(editingMovie._id, movieData);
        setSnackbarMessage(language === 'kin' ? 'Filimi yavuguruwe neza!' : 'Movie updated successfully!');
      } else {
        console.log('Creating new movie');
        console.log('Movie data being sent:', JSON.stringify(movieData, null, 2));
        await moviesAPI.createMovie(movieData);
        setSnackbarMessage(language === 'kin' ? 'Filimi yashyizweho neza!' : 'Movie created successfully!');
      }

      setSnackbarOpen(true);
      handleCloseDialog();
      loadData();
    } catch (err: any) {
      console.error('Save movie error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to save movie';
      const validationErrors = err.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        setError(`${errorMessage}: ${validationErrors.map((e: any) => e.msg).join(', ')}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (movieId: string) => {
    if (
      window.confirm(
        language === 'kin'
          ? 'Urashaka gusiba filimi?'
          : 'Are you sure you want to delete this movie?'
      )
    ) {
      try {
        await moviesAPI.deleteMovie(movieId);
        loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete movie');
      }
    }
  };

  const handleUploadPoster = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploading(true);
        setUploadProgress(0);
        
        const uploadFormData = new FormData();
        uploadFormData.append('poster', file);
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);
        
        const response = await moviesAPI.uploadPoster(uploadFormData);
        setUploadProgress(100);
        setFormData(prev => ({ ...prev, posterUrl: response.data.url }));
        setSnackbarMessage(language === 'kin' ? 'Poster yashyizweho neza!' : 'Poster uploaded successfully!');
        setSnackbarOpen(true);
        
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
        }, 1000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to upload poster');
        setUploading(false);
        setUploadProgress(0);
      }
    }
  };


  if (loading && movies.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
          {language === 'kin' ? 'Gucunga Filimi' : 'Manage Movies'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {language === 'kin' 
            ? 'Shyiraho, hindura, cyangwa siba filimi zose muri sisiteme' 
            : 'Add, edit, or remove all movies in the system'
          }
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
              boxShadow: '0 4px 15px rgba(229, 9, 20, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #B81D13 0%, #8B0000 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(229, 9, 20, 0.4)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {language === 'kin' ? 'Shyiraho Filimi Nshya' : 'Add New Movie'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.main',
                color: 'white',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {language === 'kin' ? 'Shyiraho byinshi' : 'Bulk Upload'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Movies Table */}
      <Card sx={{ 
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0,0,0,0.5)' 
          : '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(18, 18, 18, 0.8)' 
          : 'white',
        backdropFilter: 'blur(20px)',
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : '#f8f9fa' 
              }}>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Poster' : 'Poster'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Umutwe' : 'Title'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Umwaka' : 'Year'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Igihe' : 'Duration'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Ivugirwa' : 'Dubbed'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Umuvuga' : 'Dubber'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Amashakisha' : 'Views'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Umwimerere' : 'Rating'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Ibyihuse' : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movies.map(movie => (
                <TableRow 
                  key={movie._id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : '#f8f9fa',
                      transform: 'scale(1.01)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <TableCell>
                    <Box
                      component="img"
                      src={movie.posterUrl || '/placeholder-movie.jpg'}
                      alt={language === 'kin' ? movie.titleKin : movie.titleEn}
                      sx={{
                        width: 60,
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {language === 'kin' ? movie.titleKin : movie.titleEn}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {language === 'kin' ? movie.titleEn : movie.titleKin}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={movie.year} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>{movie.durationMinutes}min</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        movie.isDubbed
                          ? language === 'kin' ? 'Yego' : 'Yes'
                          : language === 'kin' ? 'Oya' : 'No'
                      }
                      color={movie.isDubbed ? 'success' : 'default'}
                      size="small"
                      icon={movie.isDubbed ? <PlayIcon /> : undefined}
                    />
                  </TableCell>
                  <TableCell>
                    {movie.dubberId?.name ? (
                      <Chip 
                        label={movie.dubberId.name} 
                        size="small" 
                        variant="outlined" 
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {movie.views || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {movie.rating?.toFixed(1) || '0.0'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={language === 'kin' ? 'Hindura' : 'Edit'}>
                        <IconButton
                          onClick={() => handleOpenDialog(movie)}
                          size="small"
                          sx={{
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.light' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={language === 'kin' ? 'Siba' : 'Delete'}>
                        <IconButton
                          onClick={() => handleDelete(movie._id)}
                          size="small"
                          sx={{
                            color: 'error.main',
                            '&:hover': { backgroundColor: 'error.light' },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Add/Edit Movie Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          },
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem',
        }}>
          {editingMovie 
            ? (language === 'kin' ? 'Hindura Filimi' : 'Edit Movie')
            : (language === 'kin' ? 'Shyiraho Filimi Nshya' : 'Add New Movie')
          }
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Left Column - Basic Info */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={language === 'kin' ? "Umutwe w'icyongereza" : 'English Title'}
                  value={formData.titleEn}
                  onChange={e => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label={language === 'kin' ? "Umutwe w'ikinyarwanda" : 'Kinyarwanda Title'}
                  value={formData.titleKin}
                  onChange={e => setFormData(prev => ({ ...prev, titleKin: e.target.value }))}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label={language === 'kin' ? "Ibisobanuro by'icyongereza" : 'English Description'}
                  value={formData.descriptionEn}
                  onChange={e => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label={language === 'kin' ? "Ibisobanuro by'ikinyarwanda" : 'Kinyarwanda Description'}
                  value={formData.descriptionKin}
                  onChange={e => setFormData(prev => ({ ...prev, descriptionKin: e.target.value }))}
                  fullWidth
                  multiline
                  rows={4}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={language === 'kin' ? 'Umwaka' : 'Year'}
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    required
                    variant="outlined"
                  />
                  <TextField
                    label={language === 'kin' ? 'Igihe (min)' : 'Duration (min)'}
                    type="number"
                    value={formData.durationMinutes}
                    onChange={e => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
                    required
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>

            {/* Right Column - Media & Settings */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Poster Upload */}
                <Card sx={{ 
                  p: 2, 
                  border: `2px dashed ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : '#ddd'}`,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.02)' 
                    : 'rgba(0, 0, 0, 0.02)',
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      {language === 'kin' ? 'Shyiraho Poster' : 'Upload Poster'}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      component="label"
                      sx={{ mb: 1 }}
                    >
                      {language === 'kin' ? 'Hitamo Dosye' : 'Choose File'}
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleUploadPoster}
                      />
                    </Button>
                    {formData.posterUrl && (
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={formData.posterUrl}
                          alt="Poster preview"
                          style={{
                            width: '100%',
                            maxWidth: 200,
                            height: 'auto',
                            borderRadius: 8,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Card>

                {/* Video Upload */}
                <VideoUploadNew
                  onUploadComplete={(file, videoUrl) => {
                    console.log('Video upload completed:', { file: file.name, videoUrl });
                    setFormData(prev => ({ ...prev, videoUrl }));
                    setSnackbarMessage(language === 'kin' ? 'Video ryashyizweho neza!' : 'Video uploaded successfully!');
                    setSnackbarOpen(true);
                    setUploading(false);
                  }}
                  onUploadError={(error) => {
                    setError(error);
                    setUploading(false);
                  }}
                  onUploadStart={() => {
                    setUploading(true);
                    setUploadProgress(0);
                  }}
                  onUploadProgress={(progress) => {
                    setUploadProgress(progress);
                  }}
                  maxSizeMB={5000} // 5GB max
                  acceptedFormats={['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm']}
                />

                {/* Additional Fields */}
                <TextField
                  label={language === 'kin' ? 'YouTube URL' : 'YouTube URL'}
                  value={formData.trailerYoutubeUrl}
                  onChange={e => setFormData(prev => ({ ...prev, trailerYoutubeUrl: e.target.value }))}
                  fullWidth
                  variant="outlined"
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label={language === 'kin' ? 'Season' : 'Season'}
                    type="number"
                    value={formData.season}
                    onChange={e => setFormData(prev => ({ ...prev, season: e.target.value }))}
                    variant="outlined"
                  />
                  <TextField
                    label={language === 'kin' ? 'Episode' : 'Episode'}
                    type="number"
                    value={formData.episode}
                    onChange={e => setFormData(prev => ({ ...prev, episode: e.target.value }))}
                    variant="outlined"
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isDubbed}
                      onChange={e => setFormData(prev => ({ ...prev, isDubbed: e.target.checked }))}
                    />
                  }
                  label={language === 'kin' ? 'Ni ivugirwa?' : 'Is Dubbed?'}
                />

                <FormControl fullWidth>
                  <InputLabel>{language === 'kin' ? 'Hitamo Umuvuga' : 'Select Dubber'}</InputLabel>
                  <Select
                    value={formData.dubberId}
                    onChange={e => setFormData(prev => ({ ...prev, dubberId: e.target.value }))}
                    label={language === 'kin' ? 'Hitamo Umuvuga' : 'Select Dubber'}
                  >
                    <MenuItem value="">
                      {language === 'kin' ? 'Hitamo' : 'Select'}
                    </MenuItem>
                    {dubbers.map(dubber => (
                      <MenuItem key={dubber._id} value={dubber._id}>
                        {dubber.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>{language === 'kin' ? 'Hitamo Ibyiciro' : 'Select Categories'}</InputLabel>
                  <Select
                    multiple
                    value={formData.categories}
                    onChange={e => {
                      console.log('Categories selected:', e.target.value);
                      setFormData(prev => ({ ...prev, categories: e.target.value as string[] }));
                    }}
                    label={language === 'kin' ? 'Hitamo Ibyiciro' : 'Select Categories'}
                    renderValue={(selected) => {
                      if (!selected || selected.length === 0) {
                        return <em>{language === 'kin' ? 'Hitamo ibyiciro' : 'Select categories'}</em>;
                      }
                      return selected.map(id => {
                        const category = categories.find(cat => cat._id === id);
                        return category ? (language === 'kin' ? category.nameKin : category.nameEn) : id;
                      }).join(', ');
                    }}
                  >
                    {categories.length === 0 ? (
                      <MenuItem disabled>
                        {language === 'kin' ? 'Nta byiciro biboneka' : 'No categories available'}
                      </MenuItem>
                    ) : (
                      categories.map(category => (
                        <MenuItem key={category._id} value={category._id}>
                          {language === 'kin' ? category.nameKin : category.nameEn}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            startIcon={<CancelIcon />}
            variant="outlined"
            sx={{ minWidth: 120 }}
          >
            {language === 'kin' ? 'Hagarika' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
            sx={{ 
              minWidth: 120,
              background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #B81D13 0%, #8B0000 100%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            {saving 
              ? (language === 'kin' ? 'Bika...' : 'Saving...') 
              : (language === 'kin' ? 'Bika' : 'Save')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Progress Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            {language === 'kin' ? 'Rya shyiraho...' : 'Uploading...'}
          </Typography>
          <Box sx={{ width: 300 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {uploadProgress}%
            </Typography>
          </Box>
        </Box>
      </Backdrop>

      {/* Save Progress Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            {language === 'kin' ? 'Bika Filimi...' : 'Saving Movie...'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
            {language === 'kin' 
              ? 'Ntuguhagarike, filimi iri gukoreshwa...' 
              : 'Please don\'t close, movie is being saved...'
            }
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="inherit">
                {language === 'kin' ? 'Amakuru' : 'Details'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                ✓
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="inherit">
                {language === 'kin' ? 'Ishusho' : 'Poster'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {formData.posterUrl ? '✓' : '○'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="inherit">
                {language === 'kin' ? 'Video' : 'Video'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {formData.videoUrl ? '✓' : '○'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Backdrop>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminMovies;
