import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signup, error, loading, clearError } = useAuth();
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    languagePref: language,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        languagePref: formData.languagePref,
      });
      navigate('/');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontWeight: 'bold' }}
          >
            {t('auth.signUp')}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            {language === 'kin'
              ? 'Kwiyandikisha kugira ngo urebe filimi zacu'
              : 'Create an account to watch our movies'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('auth.email')}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              error={
                formData.password !== formData.confirmPassword &&
                formData.confirmPassword !== ''
              }
              helperText={
                formData.password !== formData.confirmPassword &&
                formData.confirmPassword !== ''
                  ? language === 'kin'
                    ? "Ijambo ry'ibanga ritari kimwe"
                    : 'Passwords do not match'
                  : ''
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('auth.country')}
              name="country"
              value={formData.country}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>{t('auth.languagePreference')}</InputLabel>
              <Select
                name="languagePref"
                value={formData.languagePref}
                onChange={handleSelectChange}
                label={t('auth.languagePreference')}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="kin">Kinyarwanda</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={
                loading || formData.password !== formData.confirmPassword
              }
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : t('auth.signUp')}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {language === 'kin' ? 'Cyangwa' : 'OR'}
              </Typography>
            </Divider>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{ textDecoration: 'none' }}
                >
                  {t('auth.signIn')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Register;
