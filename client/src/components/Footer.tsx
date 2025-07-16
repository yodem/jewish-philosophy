import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';

export default function Footer({ copyright, links }: { copyright: string, links: { label: string, url: string }[] }) {
  return (
    <Box component="footer" width="1.0" py={3} mt={6} borderTop={1} borderColor="divider" bgcolor="background.paper" textAlign="center" color="text.secondary">
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2, mb: 1 }}>
          {links.map((link) => (
            <MuiLink key={link.url} href={link.url} underline="hover" color="primary">
              {link.label}
            </MuiLink>
          ))}
        </Box>
        {copyright && (
          <Typography variant="caption" color="text.disabled">{copyright}</Typography>
        )}
      </Container>
    </Box>
  );
} 