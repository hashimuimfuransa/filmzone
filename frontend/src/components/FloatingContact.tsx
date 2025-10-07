import React, { useState } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  ContactSupport as ContactIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';
import { contactAPI } from '../services/api';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const FloatingContact: React.FC = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = language === 'kin' ? 'Izina ryibuze' : 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = language === 'kin' ? 'Imeli ibuze' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'kin' ? 'Imeli ntabwo ari yo' : 'Invalid email format';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = language === 'kin' ? 'Umutwe w\'ubutumwa ubuze' : 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = language === 'kin' ? 'Ubutumwa ubuze' : 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await contactAPI.submitContact(formData);
      
      setSnackbar({
        open: true,
        message: language === 'kin' 
          ? 'Ubutumwa bwoherejwe neza!' 
          : 'Message sent successfully!',
        severity: 'success',
      });
      
      handleClose();
    } catch (error: any) {
      console.error('Contact form error:', error);
      
      // Handle validation errors from backend
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors: Partial<ContactFormData> = {};
        
        backendErrors.forEach((err: any) => {
          if (err.path === 'name') newErrors.name = err.msg;
          if (err.path === 'email') newErrors.email = err.msg;
          if (err.path === 'subject') newErrors.subject = err.msg;
          if (err.path === 'message') newErrors.message = err.msg;
        });
        
        setErrors(newErrors);
        
        setSnackbar({
          open: true,
          message: language === 'kin' 
            ? 'Hagomba guhuzuza ibyifuzo byose' 
            : 'Please fill in all required fields correctly',
          severity: 'error',
        });
      } else {
        setSnackbar({
          open: true,
          message: language === 'kin' 
            ? 'Habayeho ikosa mu kohereza ubutumwa' 
            : error.response?.data?.message || 'Failed to send message. Please try again.',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="contact"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #B81D13 0%, #8B0000 100%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 32px rgba(229, 9, 20, 0.3)',
        }}
      >
        <ContactIcon />
      </Fab>

      {/* Contact Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ContactIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {language === 'kin' ? 'Tuvugane' : 'Contact Us'}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <DialogContent sx={{ pt: 3 }}>
          {/* Contact Info */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              {language === 'kin' ? 'Amakuru yacu' : 'Get in Touch'}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon color="primary" />
                <Typography>
                  {language === 'kin' ? 'Imeli: info@filmzone.rw' : 'Email: info@filmzone.rw'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon color="primary" />
                <Typography>
                  {language === 'kin' ? 'Telefone: +250 788 123 456' : 'Phone: +250 788 123 456'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WhatsAppIcon sx={{ color: '#25D366' }} />
                <Button
                  variant="text"
                  sx={{ 
                    color: '#25D366',
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 211, 102, 0.1)',
                    }
                  }}
                  onClick={() => {
                    const phoneNumber = '+250788123456';
                    const message = language === 'kin' 
                      ? 'Muraho! Nshaka kuvugana na FilmZone'
                      : 'Hello! I would like to contact FilmZone';
                    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  {language === 'kin' ? 'WhatsApp: +250 788 123 456' : 'WhatsApp: +250 788 123 456'}
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationIcon color="primary" />
                <Typography>
                  {language === 'kin' 
                    ? 'Aho turi: Kigali, Rwanda' 
                    : 'Location: Kigali, Rwanda'
                  }
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Contact Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  border: '1px solid rgba(211, 47, 47, 0.3)',
                  color: '#ffcdd2'
                }}
              >
                <Typography variant="body2">
                  {language === 'kin' 
                    ? 'Hagomba guhuzuza ibyifuzo byose byanditse hepfo' 
                    : 'Please fill in all required fields below'
                  }
                </Typography>
              </Alert>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label={language === 'kin' ? 'Izina' : 'Name'}
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#E50914' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#E50914' },
                }}
              />
              
              <TextField
                fullWidth
                label={language === 'kin' ? 'Imeli' : 'Email'}
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#E50914' },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#E50914' },
                }}
              />
            </Box>

            <TextField
              fullWidth
              label={language === 'kin' ? 'Umutwe w\'ubutumwa' : 'Subject'}
              value={formData.subject}
              onChange={handleInputChange('subject')}
              error={!!errors.subject}
              helperText={errors.subject}
              sx={{ mb: 2,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#E50914' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#E50914' },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label={language === 'kin' ? 'Ubutumwa' : 'Message'}
              value={formData.message}
              onChange={handleInputChange('message')}
              error={!!errors.message}
              helperText={errors.message}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#E50914' },
                },
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiInputLabel-root.Mui-focused': { color: '#E50914' },
              }}
            />
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            sx={{ 
              color: 'rgba(255,255,255,0.7)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            {language === 'kin' ? 'Kureka' : 'Cancel'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<WhatsAppIcon />}
            sx={{
              borderColor: '#25D366',
              color: '#25D366',
              '&:hover': {
                borderColor: '#25D366',
                backgroundColor: 'rgba(37, 211, 102, 0.1)',
              },
              mr: 2,
            }}
            onClick={() => {
              const phoneNumber = '+250788123456';
              const message = language === 'kin' 
                ? 'Muraho! Nshaka kuvugana na FilmZone'
                : 'Hello! I would like to contact FilmZone';
              const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            {language === 'kin' ? 'WhatsApp' : 'WhatsApp'}
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            sx={{
              background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #B81D13 0%, #8B0000 100%)',
              },
              px: 3,
            }}
          >
            {loading 
              ? (language === 'kin' ? 'Kohereza...' : 'Sending...') 
              : (language === 'kin' ? 'Kohereza' : 'Send Message')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FloatingContact;
