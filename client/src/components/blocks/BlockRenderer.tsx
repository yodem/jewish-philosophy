import type { Block } from "@/types";
import { FeaturedArticle } from "./FeaturedArticle";
import { Subscribe } from "./Subscribe";
import { HeroSection } from "./HeroSection";
import { InfoBlock } from "./InfoBlock";
import { SeriesContent } from "./SeriesContent";

function blockRenderer(block: Block, index: number) {
    switch (block.__component) {
        case "blocks.hero-section":
            return <HeroSection {...block} key={index} />;
        case "blocks.info-block":
            return <InfoBlock {...block} key={index} />;
        case "blocks.featured-article":
            return <FeaturedArticle {...block} key={index} />;
        case "blocks.subscribe":
            return <Subscribe {...block} key={index} />;
        case "blocks.series-content":
            return <SeriesContent {...block} key={index} />;
        default:
            return null;
    }
}

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
    return blocks.map((block, index) => blockRenderer(block, index));
}