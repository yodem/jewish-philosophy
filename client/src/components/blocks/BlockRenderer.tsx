'use client';

import Box from '@mui/material/Box';
import HeroSection from './HeroSection';
import InfoBlock from './InfoBlock';
import Subscribe from './Subscribe';

export default function BlockRenderer({ blocks }: { blocks: any[] }) {
  return (
    <Box display="flex" flexDirection="column" gap={4}>
      {blocks.map((block, idx) => {
        switch (block.__component) {
          case 'blocks.hero-section':
            return <HeroSection key={idx} {...block} />;
          case 'blocks.info-block':
            return <InfoBlock key={idx} {...block} />;
          case 'blocks.subscribe':
            return <Subscribe key={idx} {...block} />;
          default:
            return null;
        }
      })}
    </Box>
  );
} 