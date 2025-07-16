'use client';

import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import NextLink from 'next/link';

export default function CustomBreadcrumbs({ items }: { items: { label: string, href?: string }[] }) {
  return (
    <Box mb={3}>
      <Breadcrumbs aria-label="breadcrumb">
        {items.map((item, idx) => (
          item.href ? (
            <MuiLink key={item.label} component={NextLink} href={item.href} underline="hover" color="primary">
              {item.label}
            </MuiLink>
          ) : (
            <Typography key={item.label} color="text.secondary">
              {item.label}
            </Typography>
          )
        ))}
      </Breadcrumbs>
    </Box>
  );
} 