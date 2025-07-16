'use client';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { StrapiImage } from '../StrapiImage';

export default function PlaylistCard({ image, title, description, cta, episodeCount }: any) {
  return (
    <Card sx={{ width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Box sx={{ width: '100%', height: 192, borderRadius: 2, overflow: 'hidden', mb: 2 }}>
        <StrapiImage src={image} alt={title} width={400} height={192} />
      </Box>
      <CardContent sx={{ flex: 1, width: '100%', p: 0 }}>
        <Typography variant="h6" fontWeight={700} align="center" gutterBottom>{title}</Typography>
        {typeof episodeCount === 'number' && (
          <Typography variant="caption" color="text.secondary" align="center" display="block" gutterBottom>
            {episodeCount} episode{episodeCount !== 1 ? 's' : ''}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ minHeight: 48, mb: 2 }}>{description}</Typography>
      </CardContent>
      <Button variant="contained" color="primary" fullWidth>{cta}</Button>
    </Card>
  );
} 