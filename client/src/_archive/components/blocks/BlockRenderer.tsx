import React from 'react';
import { Block } from '../../types';
import { Subscribe } from './Subscribe'; // Assuming this is the subscribe component
import HeroSection from './HeroSection';
import InfoBlock from './InfoBlock';

function BlockRenderer({ blocks }: { blocks: Block[] }) {  
  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        switch (block.__component) {
          case 'blocks.hero-section':
            return <HeroSection key={index} data={block} />;
          case 'blocks.subscribe':
            return <Subscribe key={index} {...block} />;
          case 'blocks.info-block':
            return <InfoBlock key={index} data={block} />;
          // Add cases for other blocks if needed
          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlockRenderer; 