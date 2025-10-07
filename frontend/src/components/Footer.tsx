import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: language === 'kin' ? 'Ibyiciro' : 'Categories',
      links: [
        {
          label: language === 'kin' ? 'Ibyabaye' : 'Action',
          href: '/movies?category=action',
        },
        {
          label: language === 'kin' ? 'Ibyishimo' : 'Comedy',
          href: '/movies?category=comedy',
        },
        {
          label: language === 'kin' ? "Ibyabaye by'ukuri" : 'Drama',
          href: '/movies?category=drama',
        },
        {
          label: language === 'kin' ? 'Ibyitangaza' : 'Horror',
          href: '/movies?category=horror',
        },
        {
          label: language === 'kin' ? 'Urukundo' : 'Romance',
          href: '/movies?category=romance',
        },
      ],
    },
    {
      title: language === 'kin' ? 'Serivisi' : 'Services',
      links: [
        {
          label: language === 'kin' ? 'Reba filimi' : 'Watch Movies',
          href: '/movies',
        },
        {
          label: language === 'kin' ? 'Filimi zivugirwa' : 'Dubbed Movies',
          href: '/movies?dubbed=true',
        },
        {
          label: language === 'kin' ? 'Abavugizi' : 'Dubbers',
          href: '/dubbers',
        },
        {
          label: language === 'kin' ? 'Ubushakashatsi' : 'Search',
          href: '/movies',
        },
      ],
    },
    {
      title: language === 'kin' ? 'Ubwiyunge' : 'Support',
      links: [
        {
          label: language === 'kin' ? 'Ubufasha' : 'Help Center',
          href: '/help',
        },
        {
          label: language === 'kin' ? 'Twandikire' : 'Contact Us',
          href: '/contact',
        },
        {
          label: language === 'kin' ? 'Amabwiriza' : 'Terms of Service',
          href: '/terms',
        },
        {
          label: language === 'kin' ? "Politiki y'Ubwoba" : 'Privacy Policy',
          href: '/privacy',
        },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#141414',
        color: 'white',
        py: 4,
        mt: 'auto',
        borderTop: '1px solid #333333',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Company Info */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#E50914' }}>
              FILMZONE
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              {language === 'kin'
                ? "Filimi nziza zose, ubwoba n'ubwoba. Reba filimi zivugirwa mu Kinyarwanda cyangwa mu Cyongereza."
                : 'Your ultimate destination for movies. Watch dubbed movies in Kinyarwanda or English.'}
            </Typography>

            {/* Contact Info */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmailIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">info@filmzone.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">+250 788 123 456</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="body2">
                  {language === 'kin' ? 'Kigali, Rwanda' : 'Kigali, Rwanda'}
                </Typography>
              </Box>
            </Box>

            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: '#E50914' }
                }}
                href="https://facebook.com/filmzone"
                target="_blank"
                rel="noopener"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: '#E50914' }
                }}
                href="https://twitter.com/filmzone"
                target="_blank"
                rel="noopener"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: '#E50914' }
                }}
                href="https://instagram.com/filmzone"
                target="_blank"
                rel="noopener"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: '#E50914' }
                }}
                href="https://youtube.com/filmzone"
                target="_blank"
                rel="noopener"
              >
                <YouTubeIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <Box key={index}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    color="inherit"
                    underline="hover"
                    sx={{
                      opacity: 0.8,
                      '&:hover': { opacity: 1 },
                      fontSize: '0.875rem',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Film Zone.{' '}
            {language === 'kin' ? 'Byose byarafashwe.' : 'All rights reserved.'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {language === 'kin'
              ? 'Yakozwe mu Rwanda ❤️'
              : 'Made with ❤️ in Rwanda'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
