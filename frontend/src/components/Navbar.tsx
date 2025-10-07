import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  TextField,
  InputAdornment,
  Badge,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  ListItemButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Movie as MovieIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Language as LanguageIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LocationIndicator from './LocationIndicator';

// Import logo as a module to ensure proper bundling
import logoImage from '/filmzonelogo.png';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, setLanguage, isRwanda, defaultTab } = useLanguage();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'kin') => {
    setLanguage(newLang);
  };

  const navigationItems = [
    { label: t('navigation.home'), path: '/', icon: <HomeIcon /> },
    { label: t('navigation.movies'), path: '/movies', icon: <MovieIcon /> },
    {
      label: t('navigation.categories'),
      path: '/movies?category=all',
      icon: <CategoryIcon />,
    },
  ];

  const adminItems = [
    { label: t('admin.dashboard'), path: '/admin', icon: <AdminIcon /> },
    {
      label: t('admin.manageMovies'),
      path: '/admin/movies',
      icon: <MovieIcon />,
    },
    {
      label: t('admin.manageCategories'),
      path: '/admin/categories',
      icon: <CategoryIcon />,
    },
    {
      label: t('admin.manageDubbers'),
      path: '/admin/dubbers',
      icon: <PersonIcon />,
    },
  ];

  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box sx={{ width: 250 }}>
        <List>
          {navigationItems.map(item => (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMobileMenuOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <ListItem divider />
              {adminItems.map(item => (
                <ListItemButton
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ 
        backgroundColor: 'rgba(10, 10, 10, 0.95)', 
        backdropFilter: 'blur(20px)',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(229, 9, 20, 0.1)',
      }}>
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 2 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
        }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', flex: '0 0 auto' }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ 
                  mr: 1,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(229, 9, 20, 0.2)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box
              component="img"
              src={logoImage}
              alt="FilmZone Logo"
              sx={{
                cursor: 'pointer',
                height: { xs: 40, sm: 48, md: 56 },
                width: 'auto',
                filter: 'brightness(0) invert(1)', // Makes logo white for dark navbar
                '&:hover': {
                  transform: 'scale(1.05)',
                  filter: 'brightness(0) invert(1) brightness(1.2)', // Slightly brighter on hover
                },
                transition: 'transform 0.2s ease, filter 0.2s ease',
              }}
              onClick={() => navigate('/')}
            />

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', ml: { sm: 2, md: 4 }, gap: 1 }}>
                {navigationItems.map(item => (
                  <Button
                    key={item.path}
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    sx={{
                      backgroundColor:
                        location.pathname === item.path
                          ? 'rgba(229, 9, 20, 0.2)'
                          : 'transparent',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: { sm: '0.9rem', md: '1rem' },
                      px: { sm: 1.5, md: 2 },
                      py: 1,
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(229, 9, 20, 0.1)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>

          {/* Center Section - Search Bar */}
          {!isMobile && (
            <Box
              component="form"
              onSubmit={handleSearch}
              sx={{ 
                flex: '1 1 auto',
                mx: 2,
                maxWidth: '400px',
              }}
            >
              <TextField
                size="small"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(229, 9, 20, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#E50914',
                      boxShadow: '0 0 0 2px rgba(229, 9, 20, 0.2)',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                  },
                }}
              />
            </Box>
          )}

          {/* Right Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1 },
            flex: '0 0 auto',
          }}>
            {/* Location Indicator */}
            <LocationIndicator />

            {/* Language Switcher */}
            <IconButton
              color="inherit"
              onClick={() =>
                handleLanguageChange(language === 'en' ? 'kin' : 'en')
              }
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                width: { xs: 36, sm: 40 },
                height: { xs: 36, sm: 40 },
                '&:hover': {
                  backgroundColor: 'rgba(229, 9, 20, 0.2)',
                },
              }}
            >
              <LanguageIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />
            </IconButton>

            {/* User Menu */}
            {user ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    '&:hover': {
                      backgroundColor: 'rgba(229, 9, 20, 0.2)',
                    },
                  }}
                >
                  <Avatar sx={{ width: { xs: 24, sm: 28 }, height: { xs: 24, sm: 28 } }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={() => {
                      navigate('/profile');
                      handleMenuClose();
                    }}
                  >
                    <AccountIcon sx={{ mr: 1 }} />
                    {t('common.profile')}
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem
                      onClick={() => {
                        navigate('/admin');
                        handleMenuClose();
                      }}
                    >
                      <AdminIcon sx={{ mr: 1 }} />
                      {t('common.admin')}
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    {t('common.logout')}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 0.5, sm: 1 },
                flexWrap: 'nowrap',
              }}>
                <Button
                  color="inherit"
                  onClick={() => navigate('/login')}
                  startIcon={<LoginIcon />}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75 },
                    borderRadius: '8px',
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'rgba(229, 9, 20, 0.2)',
                    },
                  }}
                >
                  {isMobile ? t('common.login').slice(0, 4) : t('common.login')}
                </Button>
                <Button
                  color="inherit"
                  variant="outlined"
                  onClick={() => navigate('/register')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    color: 'white',
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    px: { xs: 1, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75 },
                    borderRadius: '8px',
                    minWidth: 'auto',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: '#E50914',
                      backgroundColor: 'rgba(229, 9, 20, 0.2)',
                    },
                  }}
                >
                  {isMobile ? t('common.register').slice(0, 4) : t('common.register')}
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu()}
    </>
  );
};

export default Navbar;
