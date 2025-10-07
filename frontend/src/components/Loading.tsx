import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: number;
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  fullScreen = false,
  size = 40,
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: fullScreen ? '100vh' : '200px',
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  if (fullScreen) {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: theme => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        open={true}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

export default Loading;
