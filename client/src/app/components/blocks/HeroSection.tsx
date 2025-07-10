import Link from "next/link";
import type { HeroSectionProps } from "@/types";
import { StrapiImage } from "@/app/components/StrapiImage";

export function HeroSection({
    theme,
    heading,
    cta,
    image,
    logo,
    author,
    publishedAt,
    darken = false,
}: Readonly<HeroSectionProps>) {
    const themeClasses = {
        container: theme === "turquoise" ? "text-gray-800" : "text-white",
        button:
            theme === "turquoise"
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-black hover:bg-gray-200",
    };

    return (
        <section className="relative flex min-h-[60vh] items-center">
            <div className="absolute inset-0 -z-20 bg-gradient-to-b from-yellow-300 to-orange-200 rounded-b-[9rem]">
                <StrapiImage
                    src={image.url}
                    alt={image.alternativeText || "No alternative text provided"}
                    className="h-full w-full opacity-80 object-cover rounded-b-[10rem]"
                    width={1920}
                    height={1080}
                    priority
                />
                {darken && <div className="absolute inset-0 bg-black/50 -z-10"></div>}
            </div>
            <div className={`z-10 p-4 ${themeClasses.container}`}>
                <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
                    {heading}
                </h1>
                {author && <p className="mt-4 text-lg md:text-xl">{author}</p>}
                {publishedAt && <p className="mt-2 text-base text-gray-300">{publishedAt}</p>}
                {cta && (
                    <Link
                        href={cta.href}
                        target={cta.isExternal ? "_blank" : "_self"}
                        className={`mt-8 inline-block rounded-md px-8 py-3 text-lg font-semibold transition-colors ${themeClasses.button}`}
                    >
                        {cta.text}
                    </Link>
                )}
            </div>
            {logo && (
                <div className="absolute top-8 left-24 -translate-x-1/2 transform">
                    <StrapiImage
                        src={logo.image.url}
                        alt={logo.image.alternativeText || "No alternative text provided"}
                        width={120}
                        height={120}
                    />
                </div>
            )}
        </section>
    );
}