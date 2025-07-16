'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { StrapiImage } from '../StrapiImage';
import MuiLink from '@mui/material/Link';
import NextLink from 'next/link';

export default function HeroSection({ heading, author, image, cta }: any) {
  return (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4} py={6}>
      {image && (
        <Box flexShrink={0} width={{ xs: '100%', md: 400 }} mb={{ xs: 2, md: 0 }}>
          <Box sx={{ borderRadius: 2, overflow: 'hidden', width: '100%', height: 'auto' }}>
            <StrapiImage src={image.url} alt={image.alternativeText} width={400} height={300} />
          </Box>
        </Box>
      )}
      <Box flex={1} textAlign="center">
        <Typography variant="h3" fontWeight={800} gutterBottom>{heading}</Typography>
        {author && <Typography variant="subtitle1" color="text.secondary" gutterBottom>By {author}</Typography>}
        {cta && (
          <Button component={NextLink} href={cta.href} variant="contained" color="primary" size="large" sx={{ mt: 2 }}>
            {cta.text}
          </Button>
        )}
      </Box>
    </Box>
  );
} 