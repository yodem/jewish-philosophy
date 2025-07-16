import { getAllSeriesContent } from "@/data/loaders";
import { SeriesContent } from "@/components/blocks/SeriesContent";
import Link from "next/link";

export default async function AllSeriesContentPage() {
  const { data } = await getAllSeriesContent();
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="p-8 text-center text-gray-500">No series content found.</div>;
  }
  return (
    <div className="space-y-8 p-8">
      {data.map((item: any) => (
        item.slug ? (
          <Link
            key={item.id}
            href={`/content-series/${item.slug}`}
            className="block transition-transform hover:scale-[1.02] hover:shadow-lg rounded-lg"
            prefetch={false}
          >
            <SeriesContent {...item} />
          </Link>
        ) : (
          <SeriesContent key={item.id} {...item} />
        )
      ))}
    </div>
  );
} 