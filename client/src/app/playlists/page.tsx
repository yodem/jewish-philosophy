import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import PlaylistsCarousel from '@/components/PlaylistsCarousel';
import { getAllPlaylists, getPageBySlug } from '@/data/loaders';

export default async function PlaylistsPage() {
  const pageRes = await getPageBySlug('playlists');
  const page = pageRes?.data?.[0] || {};
  const blocks = page?.blocks || [];
  const title = page?.title || 'Playlists';
  const description = page?.description || '';
  const playlists = await getAllPlaylists();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom>{title}</Typography>
      {description && <Typography variant="subtitle1" color="text.secondary" gutterBottom>{description}</Typography>}
      <BlockRenderer blocks={blocks} />
      <Typography variant="h4" fontWeight={800} gutterBottom>All Playlists</Typography>
      <PlaylistsCarousel playlists={playlists} />
    </Container>
  );
} 