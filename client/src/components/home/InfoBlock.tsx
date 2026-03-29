import type { InfoBlockProps } from "@/types";
import { StrapiImage } from "@/components/shared/StrapiImage";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function InfoBlock({ data }: { data: InfoBlockProps }) {
  const { heading, content, image, cta, reversed } = data;

  return (
    <section
      className={`flex flex-col items-center gap-6 rounded-lg border border-border bg-card p-6 md:gap-10 md:p-8 ${
        reversed ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      {image && (
        <div className="w-full shrink-0 overflow-hidden rounded-lg md:w-[400px]">
          <StrapiImage
            src={image.url}
            alt={image.alternativeText}
            width={400}
            height={300}
            aspectRatio="landscape"
            className="h-full w-full"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center gap-3">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          {heading}
        </h2>
        <div className="prose prose-base max-w-none text-muted-foreground md:prose-lg text-justify">
          <ReactMarkdown
            components={{
              a: ({ children, href }) => (
                <Link href={href ?? "#"}>
                  <span>{children}</span>
                </Link>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
        {cta && (
          <Link
            href={cta.href}
            className="mt-2 inline-flex w-fit items-center rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {cta.text}
          </Link>
        )}
      </div>
    </section>
  );
}
