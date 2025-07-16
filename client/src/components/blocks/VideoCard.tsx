'use client';
import React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export default function VideoCard({ image, title, cta }: any) {
  return (
    <Card sx={{ width: 208, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{ width: 208, height: 128, borderRadius: 2, mb: 1 }}
      />
      <CardContent sx={{ flex: 1, width: '100%', p: 0 }}>
        <Typography variant="subtitle1" fontWeight={600} align="center" gutterBottom>{title}</Typography>
      </CardContent>
      <Button variant="contained" color="primary" fullWidth>{cta}</Button>
    </Card>
  );
} 