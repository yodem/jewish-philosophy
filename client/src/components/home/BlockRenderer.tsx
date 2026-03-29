import type { Block } from "@/types";
import HeroSection from "./HeroSection";
import InfoBlock from "./InfoBlock";
import { Subscribe } from "@/components/forms/Subscribe";

function assertNever(x: never): never {
  throw new Error(`Unexpected block component: ${(x as { __component?: string }).__component}`);
}

/**
 * Renders a list of CMS blocks by matching __component to the
 * corresponding React component. Uses an exhaustive switch to
 * guarantee compile-time safety when new block types are added.
 */
export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        const component = block.__component;

        switch (component) {
          case "blocks.hero-section":
            return <HeroSection key={block.id ?? index} data={block} />;
          case "blocks.info-block":
            return <InfoBlock key={block.id ?? index} data={block} />;
          case "blocks.subscribe":
            return <Subscribe key={block.id ?? index} {...block} />;
          case undefined:
            // CMS may omit __component for malformed entries
            return null;
          default:
            return assertNever(block);
        }
      })}
    </div>
  );
}
