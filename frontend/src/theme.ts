import { createTheme } from '@mui/material/styles';

export const netflixTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#E50914', // Netflix red
      light: '#FF6B6B',
      dark: '#B71C1C',
    },
    secondary: {
      main: '#FFFFFF',
      light: '#F5F5F5',
      dark: '#CCCCCC',
    },
    background: {
      default: '#0A0A0A', // Deeper black for premium feel
      paper: '#1A1A1A', // Slightly lighter for cards
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
    },
    grey: {
      50: '#F5F5F5',
      100: '#E0E0E0',
      200: '#CCCCCC',
      300: '#B3B3B3',
      400: '#999999',
      500: '#808080',
      600: '#666666',
      700: '#4D4D4D',
      800: '#333333',
      900: '#1A1A1A',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
    h1: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: 'clamp(0.8rem, 1.2vw, 0.875rem)',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          overflowX: 'hidden',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#E50914 #333333',
        },
        '*::-webkit-scrollbar': {
          width: '8px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#333333',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#E50914',
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#B71C1C',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(229, 9, 20, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1A1A1A',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: '#2A2A2A',
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(229, 9, 20, 0.2)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: 'clamp(0.9rem, 1.2vw, 1rem)',
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          backgroundColor: '#E50914',
          boxShadow: '0 4px 20px rgba(229, 9, 20, 0.3)',
          '&:hover': {
            backgroundColor: '#B71C1C',
            boxShadow: '0 8px 30px rgba(229, 9, 20, 0.4)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: '#FFFFFF',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: '#E50914',
            backgroundColor: 'rgba(229, 9, 20, 0.1)',
            boxShadow: '0 4px 20px rgba(229, 9, 20, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(229, 9, 20, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E50914',
              boxShadow: '0 0 0 2px rgba(229, 9, 20, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#FFFFFF',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(229, 9, 20, 0.2)',
            borderColor: '#E50914',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(229, 9, 20, 0.1)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(229, 9, 20, 0.1)',
          },
        },
      },
    },
  },
});

export default netflixTheme;