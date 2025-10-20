import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResponsaBySlug } from "@/data/loaders";
import { generateMetadata as createMetadata } from "@/lib/metadata";
import { Category } from "@/types";
import ResponsaPageClient from "./ResponsaPageClient";

interface ResponsaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResponsaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const responsa = await getResponsaBySlug(slug);
  
  if (!responsa) {
    return {
      title: "שאלה לא נמצאה | שלום צדיק - פילוסופיה יהודית",
      description: "פלטפורמה מקוונת ללימוד פילוסופיה יהודית",
    };
  }
  
  return createMetadata({
    title: `${responsa.title} | שאלות ותשובות | שלום צדיק - פילוסופיה יהודית`,
    description: 'פלטפורמה מקוונת ללימוד פילוסופיה יהודית',
    url: `/responsa/${slug}`,
    type: "article",
    publishedTime: responsa.publishedAt,
    modifiedTime: responsa.updatedAt,
    authors: ['שלום צדיק'],
    tags: responsa.categories?.map((cat: Category) => cat.name),
    keywords: `שאלות ותשובות, ${responsa.categories?.map((cat: Category) => cat.name).join(', ')}, פילוסופיה יהודית`,
  });
}

export default async function ResponsaPage({ params }: ResponsaPageProps) {
  const { slug } = await params;
  const responsa = await getResponsaBySlug(slug);

  if (!responsa) {
    notFound();
  }

  return (
    <ResponsaPageClient initialResponsa={responsa} slug={slug} />
  );
}