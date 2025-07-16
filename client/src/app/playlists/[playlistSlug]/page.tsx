import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import Breadcrumbs from '@/components/Breadcrumbs';
import VideoCard from '@/components/blocks/VideoCard';
import PlaylistsCarousel from '@/components/PlaylistsCarousel';
import VideosCarousel from '@/components/VideosCarousel';
import NextLink from 'next/link';
import { getPlaylistBySlug, getAllPlaylists } from '@/data/loaders';

export default async function PlaylistPage({ params }: { params: { playlistSlug: string } }) {  
  const playlist = await getPlaylistBySlug(params.playlistSlug);
  
  const allPlaylists = await getAllPlaylists();
  const otherPlaylists = allPlaylists.filter((p: any) => p.slug !== params.playlistSlug);
  const videos = playlist?.videos || [];
  const firstVideo = videos.length > 0 ? videos[0] : null;
  const restVideos = videos.length > 1 ? videos.slice(1) : [];

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: playlist?.title }]} />
      <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>{playlist?.title}</Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>{playlist?.description}</Typography>
      </Box>
      {firstVideo && (
        <Box mb={6} display="flex" flexDirection="column" alignItems="center">
          <MuiLink component={NextLink} href={`/playlists/${playlist.slug}/${firstVideo.slug}`} sx={{ width: '100%', maxWidth: 768, textDecoration: 'none' }}>
            <VideoCard image={firstVideo.imageUrl300x400 || firstVideo.imageUrlStandard} title={firstVideo.title} cta="Watch Video" />
          </MuiLink>
          <Box mt={2} textAlign="center" maxWidth={672} color="text.secondary">
            {firstVideo.description}
          </Box>
        </Box>
      )}
      {restVideos.length > 0 && (
        <Box mb={8}>
          <Typography variant="h6" fontWeight={600} align="center" gutterBottom>More Episodes</Typography>
          <VideosCarousel videos={restVideos} playlistSlug={playlist.slug} />
        </Box>
      )}
      {otherPlaylists.length > 0 && (
        <Box mt={8}>
          <Typography variant="h6" fontWeight={600} align="center" gutterBottom>Other Playlists</Typography>
          <PlaylistsCarousel playlists={otherPlaylists} />
        </Box>
      )}
    </Container>
  );
} 