import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Movie as MovieIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const drawerWidth = 280;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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

  const menuItems = [
    {
      text: language === 'kin' ? 'Dashboard' : 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
      badge: null,
    },
    {
      text: language === 'kin' ? 'Filimi' : 'Movies',
      icon: <MovieIcon />,
      path: '/admin/movies',
      badge: null,
    },
    {
      text: language === 'kin' ? 'Ibyiciro' : 'Categories',
      icon: <CategoryIcon />,
      path: '/admin/categories',
      badge: null,
    },
    {
      text: language === 'kin' ? 'Abavuga' : 'Dubbers',
      icon: <PersonIcon />,
      path: '/admin/dubbers',
      badge: null,
    },
    {
      text: language === 'kin' ? 'Abakoresha' : 'Users',
      icon: <PeopleIcon />,
      path: '/admin/users',
      badge: null,
    },
    {
      text: language === 'kin' ? 'Ubutumwa' : 'Messages',
      icon: <EmailIcon />,
      path: '/admin/contacts',
      badge: null,
    },
  ];

  const drawer = (
    <Box>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #E50914 0%, #B81D13 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Box
          component="img"
          src="/filmzonelogo.png"
          alt="FilmZone Logo"
          sx={{
            height: 40,
            width: 'auto',
            mb: 1,
            filter: 'brightness(0) invert(1)', // Makes logo white
          }}
        />
        <Typography
          variant="body2"
          sx={{
            opacity: 0.9,
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}
        >
          {language === 'kin' ? 'Admin Panel' : 'Admin Panel'}
        </Typography>
      </Box>

      {/* User Info Section */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name}
            </Typography>
            <Chip
              label={language === 'kin' ? 'Admin' : 'Admin'}
              size="small"
              color="primary"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                mt: 0.5,
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                py: 1.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? 'white' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                }}
              />
              {item.badge && (
                <Badge
                  badgeContent={item.badge}
                  color="error"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Quick Stats */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 'bold',
            color: 'text.secondary',
            mb: 1,
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {language === 'kin' ? 'Ibyihuse' : 'Quick Stats'}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {language === 'kin' ? 'Amashakisha' : 'Views'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {language === 'kin' ? 'Amashakisha' : 'Reviews'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {language === 'kin' ? 'Urwego' : 'Rating'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'white',
          color: 'text.primary',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 1px 3px rgba(0,0,0,0.3)' 
            : '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              color: 'text.primary',
            }}
          >
            {language === 'kin' ? 'Admin Panel' : 'Admin Panel'}
          </Typography>

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                <AccountIcon sx={{ mr: 1 }} />
                {t('common.profile')}
              </MenuItem>
              <MenuItem onClick={() => { navigate('/'); handleMenuClose(); }}>
                <SettingsIcon sx={{ mr: 1 }} />
                {language === 'kin' ? 'Ahabanza' : 'Back to Site'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                {t('common.logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(18, 18, 18, 0.95)' 
                : 'white',
              backdropFilter: 'blur(20px)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(0, 0, 0, 0.8)' 
            : '#f8f9fa',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
