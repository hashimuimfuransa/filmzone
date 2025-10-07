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
  Alert,
  CircularProgress,
  Pagination,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { useLanguage } from '../../contexts/LanguageContext';
import { usersAPI } from '../../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  country?: string;
  languagePref: 'en' | 'kin';
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  recentUsers: number;
  usersByCountry: Array<{ _id: string; count: number }>;
  usersByLanguage: Array<{ _id: string; count: number }>;
  usersByMonth: Array<{ _id: { year: number; month: number }; count: number }>;
}

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN',
    country: '',
    languagePref: 'en' as 'en' | 'kin',
  });

  useEffect(() => {
    loadData();
    loadStats();
  }, [currentPage, searchQuery, roleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      const response = await usersAPI.getUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await usersAPI.getUserStats();
      setStats(response.data.stats);
    } catch (err: any) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country || '',
        languagePref: user.languagePref,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'USER',
        country: '',
        languagePref: 'en',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await usersAPI.updateUser(editingUser._id, formData);
      }

      handleCloseDialog();
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      window.confirm(
        language === 'kin'
          ? 'Urashaka gusiba umukoresha?'
          : 'Are you sure you want to delete this user?'
      )
    ) {
      try {
        await usersAPI.deleteUser(userId);
        loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading && users.length === 0) {
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
          {language === 'kin' ? 'Gucunga Abakoresha' : 'Manage Users'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {language === 'kin' 
            ? 'Reba, hindura, cyangwa siba abakoresha bose muri sisiteme' 
            : 'View, edit, or remove all users in the system'
          }
        </Typography>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Abakoresha Bose' : 'Total Users'}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalAdmins}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Abayobozi' : 'Admins'}
                  </Typography>
                </Box>
                <AdminIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ed6c02 0%, #e65100 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.totalRegularUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Abakoresha B\'ukuri' : 'Regular Users'}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
          
          <Card sx={{ 
            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
            color: 'white',
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {stats.recentUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {language === 'kin' ? 'Bashya (30 iminsi)' : 'Recent (30 days)'}
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder={language === 'kin' ? 'Shakisha abakoresha...' : 'Search users...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{language === 'kin' ? 'Hitamo' : 'Filter'}</InputLabel>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            label={language === 'kin' ? 'Hitamo' : 'Filter'}
          >
            <MenuItem value="">
              {language === 'kin' ? 'Byose' : 'All'}
            </MenuItem>
            <MenuItem value="USER">
              {language === 'kin' ? 'Abakoresha' : 'Users'}
            </MenuItem>
            <MenuItem value="ADMIN">
              {language === 'kin' ? 'Abayobozi' : 'Admins'}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
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
                  {language === 'kin' ? 'Umukoresha' : 'User'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Imeli' : 'Email'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Uruhare' : 'Role'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Igihugu' : 'Country'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Ururimi' : 'Language'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Yashyizweho' : 'Joined'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  {language === 'kin' ? 'Ibyihuse' : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(user => (
                <TableRow 
                  key={user._id}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user._id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'ADMIN' ? 'error' : 'primary'}
                      size="small"
                      icon={user.role === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.country || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LanguageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.languagePref === 'kin' ? 'Kinyarwanda' : 'English'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title={language === 'kin' ? 'Hindura' : 'Edit'}>
                        <IconButton
                          onClick={() => handleOpenDialog(user)}
                          size="small"
                          sx={{
                            color: 'primary.main',
                            '&:hover': { backgroundColor: 'primary.light' },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      {user.role !== 'ADMIN' && (
                        <Tooltip title={language === 'kin' ? 'Siba' : 'Delete'}>
                          <IconButton
                            onClick={() => handleDelete(user._id)}
                            size="small"
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'error.light' },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
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

      {/* Edit User Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
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
          {language === 'kin' ? 'Hindura Umukoresha' : 'Edit User'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label={language === 'kin' ? 'Amazina' : 'Name'}
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label={language === 'kin' ? 'Imeli' : 'Email'}
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>{language === 'kin' ? 'Uruhare' : 'Role'}</InputLabel>
              <Select
                value={formData.role}
                onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as 'USER' | 'ADMIN' }))}
                label={language === 'kin' ? 'Uruhare' : 'Role'}
              >
                <MenuItem value="USER">
                  {language === 'kin' ? 'Umukoresha' : 'User'}
                </MenuItem>
                <MenuItem value="ADMIN">
                  {language === 'kin' ? 'Umucyobozi' : 'Admin'}
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={language === 'kin' ? 'Igihugu' : 'Country'}
              value={formData.country}
              onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              fullWidth
              variant="outlined"
            />
            <FormControl fullWidth>
              <InputLabel>{language === 'kin' ? 'Ururimi' : 'Language'}</InputLabel>
              <Select
                value={formData.languagePref}
                onChange={e => setFormData(prev => ({ ...prev, languagePref: e.target.value as 'en' | 'kin' }))}
                label={language === 'kin' ? 'Ururimi' : 'Language'}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="kin">Kinyarwanda</MenuItem>
              </Select>
            </FormControl>
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
            startIcon={<SaveIcon />}
            sx={{ 
              minWidth: 120,
              background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #B81D13 0%, #8B0000 100%)',
              },
            }}
          >
            {language === 'kin' ? 'Bika' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
