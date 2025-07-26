import { Metadata } from "next";
import { getResponsaBySlug } from "@/data/loaders";
import { generateMetadata as createMetadata } from "@/lib/metadata";
import { Category } from "@/types";

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
  
  return createMetadata({
    title: `${responsa.title} | שאלות ותשובות - פילוסופיה יהודית`,
    description: responsa.content.slice(0, 160),
    url: `/responsa/${params.slug}`,
    type: "article",
    publishedTime: responsa.publishedAt,
    modifiedTime: responsa.updatedAt,
    tags: responsa.categories?.map((cat: Category) => cat.name),
    keywords: `שאלות ותשובות, ${responsa.categories?.map((cat: Category) => cat.name).join(', ')}, הלכה פסוקה, פסיקה הלכתית, רבנים, בית מדרש דיגיטלי`,
  });
} 