import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { dubbersAPI } from '../../services/api';

interface Dubber {
  _id: string;
  name: string;
  bio?: string;
  slug: string;
  avatarUrl?: string;
}

const AdminDubbers: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [dubbers, setDubbers] = useState<Dubber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDubber, setEditingDubber] = useState<Dubber | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadDubbers();
  }, []);

  const loadDubbers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dubbersAPI.getDubbers();
      setDubbers(response.data.dubbers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dubbers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (dubber?: Dubber) => {
    if (dubber) {
      setEditingDubber(dubber);
      setFormData({
        name: dubber.name,
        bio: dubber.bio || '',
        avatarUrl: dubber.avatarUrl || '',
      });
    } else {
      setEditingDubber(null);
      setFormData({
        name: '',
        bio: '',
        avatarUrl: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDubber(null);
  };

  const handleSave = async () => {
    try {
      if (editingDubber) {
        await dubbersAPI.updateDubber(editingDubber._id, formData);
      } else {
        await dubbersAPI.createDubber(formData);
      }

      handleCloseDialog();
      loadDubbers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save dubber');
    }
  };

  const handleDelete = async (dubberId: string) => {
    if (
      window.confirm(
        language === 'kin'
          ? 'Urashaka gusiba umuvugizi?'
          : 'Are you sure you want to delete this dubber?'
      )
    ) {
      try {
        await dubbersAPI.deleteDubber(dubberId);
        loadDubbers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete dubber');
      }
    }
  };

  const handleUploadAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await dubbersAPI.uploadAvatar(formData);
        setFormData(prev => ({ ...prev, avatarUrl: response.data.url }));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to upload avatar');
      }
    }
  };

  if (loading) {
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          {t('admin.manageDubbers')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('admin.addNewDubber')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{language === 'kin' ? 'Avatar' : 'Avatar'}</TableCell>
              <TableCell>{language === 'kin' ? 'Amazina' : 'Name'}</TableCell>
              <TableCell>
                {language === 'kin' ? 'Ibisobanuro' : 'Bio'}
              </TableCell>
              <TableCell>{language === 'kin' ? 'Slug' : 'Slug'}</TableCell>
              <TableCell>
                {language === 'kin' ? 'Ibyihuse' : 'Actions'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dubbers.map(dubber => (
              <TableRow key={dubber._id}>
                <TableCell>
                  <Avatar src={dubber.avatarUrl} sx={{ width: 50, height: 50 }}>
                    {dubber.name.charAt(0).toUpperCase()}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {dubber.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {dubber.bio || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {dubber.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(dubber)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(dubber._id)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dubber Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingDubber ? t('admin.editDubber') : t('admin.addNewDubber')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={language === 'kin' ? 'Amazina' : 'Name'}
              value={formData.name}
              onChange={e =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label={language === 'kin' ? 'Ibisobanuro' : 'Bio'}
              value={formData.bio}
              onChange={e =>
                setFormData(prev => ({ ...prev, bio: e.target.value }))
              }
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label={language === 'kin' ? 'Avatar URL' : 'Avatar URL'}
              value={formData.avatarUrl}
              onChange={e =>
                setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))
              }
              fullWidth
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              component="label"
            >
              {language === 'kin' ? 'Kuramo Avatar' : 'Upload Avatar'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleUploadAvatar}
              />
            </Button>
            {formData.avatarUrl && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Avatar
                  src={formData.avatarUrl}
                  sx={{ width: 100, height: 100 }}
                >
                  {formData.name.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDubbers;
