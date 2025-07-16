'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import NextLink from 'next/link';
import { StrapiImage } from './StrapiImage';
import { NavbarHeader } from '@/types';
import { useDirection } from './DirectionProvider';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function Navbar({ header }: { header: NavbarHeader }) {
  const navLinks = header?.navigation || [];
  const { direction, toggleDirection } = useDirection();
  return (
    <AppBar position="fixed" color="primary" elevation={1} sx={{ mb: 2 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center" gap={4}>
         <StrapiImage src={header?.logo?.image?.url || ''} width={50} height={50} alt={header?.logo?.image?.alternativeText || ''} />
          {navLinks.map((link) => (
            <MuiLink key={link.id} component={NextLink} href={link.href} color="inherit" underline="hover" sx={{ fontWeight: 500 }}>
              {link.text}
            </MuiLink>
          ))}
        </Box>
        {header?.cta && (
          <Button component={NextLink} href={header.cta.href} variant="contained"  sx={{ fontWeight: 600 }}>
            {header.cta.text}
          </Button>
        )}
        <FormControlLabel
          control={<Switch checked={direction === 'rtl'} onChange={toggleDirection} />}
          label={direction === 'rtl' ? 'עברית (RTL)' : 'English (LTR)'}
          sx={{ ml: 2 }}
        />
      </Toolbar>
    </AppBar>
  );
} 