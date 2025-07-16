'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { StrapiImage } from '../StrapiImage';

export default function InfoBlock({ image, heading, content }: any) {
  return (
    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4} p={4} borderRadius={2} boxShadow={2} alignItems="center" justifyContent="space-between">
      {image && (
        <Box width={{ xs: '100%', md: 400 }} flexShrink={0} mb={{ xs: 2, md: 0 }}>
          <Box sx={{ borderRadius: 1.5, overflow: 'hidden', width: '100%', height: 'auto' }}>
            <StrapiImage src={image.url} alt={image.alternativeText} width={400} height={300} />
          </Box>
        </Box>
      )}
      <Box flex={1}>
        <Typography variant="h5" fontWeight={700} gutterBottom>{heading}</Typography>
        <Typography color="text.secondary">{content}</Typography>
      </Box>
    </Box>
  );
} 