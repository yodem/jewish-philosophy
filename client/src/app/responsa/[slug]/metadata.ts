import { Metadata } from "next";
import { getResponsaBySlug } from "@/data/loaders";

interface MetadataProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const responsa = await getResponsaBySlug(params.slug);
  
  if (!responsa) {
    return {
      title: "Responsa Not Found",
    };
  }
  
  return {
    title: `${responsa.title} | שאלות ותשובות`,
    description: responsa.content.slice(0, 160),
  };
} 