import type { FeaturedArticleProps } from "@/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { StrapiImage } from "../StrapiImage";

export function FeaturedArticle({
  headline,
  link,
  excerpt,
  image,
}: Readonly<FeaturedArticleProps>) {
  return (
    <article className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 bg-white rounded-lg shadow-md p-8 my-8">
      <div className="flex-1 mb-6 md:mb-0">
        <h3 className="text-3xl font-bold mb-4">{headline}</h3>
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <p className="text-gray-700 mb-4" {...props} />,
          }}
        >
          {excerpt}
        </ReactMarkdown>
        <Link
          href={link.href}
          className="inline-block mt-2 px-6 py-2 bg-turquoise-500 text-white font-semibold rounded hover:bg-turquoise-600 transition-colors duration-200"
        >
          {link.text}
        </Link>
      </div>
      <div className="flex-shrink-0">
        <StrapiImage
          src={image.url}
          alt={image.alternativeText || "No alternative text provided"}
          height={200}
          width={300}
          className="rounded-lg object-cover shadow"
        />
      </div>
    </article>
  );
}
