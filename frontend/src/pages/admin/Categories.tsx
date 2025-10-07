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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { categoriesAPI } from '../../services/api';

interface Category {
  _id: string;
  nameEn: string;
  nameKin: string;
  slug: string;
  descriptionEn?: string;
  descriptionKin?: string;
  iconUrl?: string;
}

const AdminCategories: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    nameEn: '',
    nameKin: '',
    descriptionEn: '',
    descriptionKin: '',
    iconUrl: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await categoriesAPI.getCategories();
      setCategories(response.data.categories);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        nameEn: category.nameEn,
        nameKin: category.nameKin,
        descriptionEn: category.descriptionEn || '',
        descriptionKin: category.descriptionKin || '',
        iconUrl: category.iconUrl || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        nameEn: '',
        nameKin: '',
        descriptionEn: '',
        descriptionKin: '',
        iconUrl: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory._id, formData);
      } else {
        await categoriesAPI.createCategory(formData);
      }

      handleCloseDialog();
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (
      window.confirm(
        language === 'kin'
          ? 'Urashaka gusiba icyiciro?'
          : 'Are you sure you want to delete this category?'
      )
    ) {
      try {
        await categoriesAPI.deleteCategory(categoryId);
        loadCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete category');
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
          {t('admin.manageCategories')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('admin.addNewCategory')}
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
              <TableCell>
                {language === 'kin' ? 'Icyongereza' : 'English'}
              </TableCell>
              <TableCell>
                {language === 'kin' ? 'Ikinyarwanda' : 'Kinyarwanda'}
              </TableCell>
              <TableCell>
                {language === 'kin' ? 'Ibisobanuro' : 'Description'}
              </TableCell>
              <TableCell>{language === 'kin' ? 'Slug' : 'Slug'}</TableCell>
              <TableCell>
                {language === 'kin' ? 'Ibyihuse' : 'Actions'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category._id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {category.nameEn}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {category.nameKin}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {language === 'kin'
                      ? category.descriptionKin
                      : category.descriptionEn}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {category.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleOpenDialog(category)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(category._id)}
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

      {/* Add/Edit Category Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory
            ? t('admin.editCategory')
            : t('admin.addNewCategory')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={
                language === 'kin' ? "Umutwe w'icyongereza" : 'English Name'
              }
              value={formData.nameEn}
              onChange={e =>
                setFormData(prev => ({ ...prev, nameEn: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label={
                language === 'kin'
                  ? "Umutwe w'ikinyarwanda"
                  : 'Kinyarwanda Name'
              }
              value={formData.nameKin}
              onChange={e =>
                setFormData(prev => ({ ...prev, nameKin: e.target.value }))
              }
              fullWidth
              required
            />
            <TextField
              label={
                language === 'kin'
                  ? "Ibisobanuro by'icyongereza"
                  : 'English Description'
              }
              value={formData.descriptionEn}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  descriptionEn: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label={
                language === 'kin'
                  ? "Ibisobanuro by'ikinyarwanda"
                  : 'Kinyarwanda Description'
              }
              value={formData.descriptionKin}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  descriptionKin: e.target.value,
                }))
              }
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label={language === 'kin' ? 'Icon URL' : 'Icon URL'}
              value={formData.iconUrl}
              onChange={e =>
                setFormData(prev => ({ ...prev, iconUrl: e.target.value }))
              }
              fullWidth
            />
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

export default AdminCategories;
