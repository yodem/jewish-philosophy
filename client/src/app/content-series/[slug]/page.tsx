import { getSeriesContentBySlug, getAllSeriesContent } from "@/data/loaders";
import { SeriesContent } from "@/components/blocks/SeriesContent";
import { notFound } from "next/navigation";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SeriesContentSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const res = await getSeriesContentBySlug(slug);
  const data = Array.isArray(res.data) ? res.data[0] : res.data;
  if (!data) notFound();

  // Fetch all items to build the sidebar
  const allRes = await getAllSeriesContent();
  const allItems = Array.isArray(allRes.data) ? allRes.data : [];
  const sidebarItems = allItems.filter(
    (item: any) => item.seriesName === data.seriesName && item.slug !== data.slug
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8">
      {/* Sidebar */}
      <aside className="md:w-1/4 w-full mb-8 md:mb-0">
        <div className="sticky top-8">
          <h3 className="text-lg font-semibold mb-4">More in this series</h3>
          <ul className="space-y-2">
            {/* Current item, styled and not a link */}
            <li className="font-bold text-blue-900 bg-blue-100 rounded px-2 py-1 cursor-default">
              {data.Title}
            </li>
            {/* Other items */}
            {sidebarItems.length === 0 && (
              <li className="text-gray-400 text-sm">No other items in this series.</li>
            )}
            {sidebarItems.map((item: any) => (
              <li key={item.id}>
                <Link
                  href={`/content-series/${item.slug}`}
                  className="text-blue-600 hover:underline"
                  prefetch={false}
                >
                  {item.Title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1">
        <SeriesContent {...data} />
      </main>
    </div>
  );
} 