import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getResponsaBySlug } from "@/data/loaders";
import { generateMetadata as createMetadata } from "@/lib/metadata";
import { extractQuestionFromResponsa } from "@/lib/seo-helpers";
import { Category } from "@/types";
import ResponsaPage from "./ResponsaPage";

// Revalidate every 60s so new comments appear quickly while keeping short-term cache
export const revalidate = 60;

interface ResponsaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ResponsaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const responsa = await getResponsaBySlug(slug);

  if (!responsa) {
    return {
      title: "שאלה לא נמצאה | שלום צדיק - פילוסופיה דתית",
      description: "פלטפורמה מקוונת ללימוד פילוסופיה דתית",
    };
  }

  // Extract question text for description (longer for sharing previews)
  const questionPreview = extractQuestionFromResponsa(responsa.content, 280);

  return createMetadata({
    title: `${responsa.title} | שאלות ותשובות | שלום צדיק - פילוסופיה דתית`,
    description: questionPreview,
    url: `/responsa/${slug}`,
    type: "article",
    publishedTime: responsa.publishedAt,
    modifiedTime: responsa.updatedAt,
    authors: ['שלום צדיק'],
    tags: responsa.categories?.map((cat: Category) => cat.name),
    keywords: `שאלות ותשובות, ${responsa.categories?.map((cat: Category) => cat.name).join(', ')}, פילוסופיה דתית`,
  });
}

export default async function ResponsaServerPage({ params }: ResponsaPageProps) {
  const { slug } = await params;
  const responsa = await getResponsaBySlug(slug);

  if (!responsa) {
    notFound();
  }

  return (
    <ResponsaPage responsa={responsa} slug={slug} />
  );
}