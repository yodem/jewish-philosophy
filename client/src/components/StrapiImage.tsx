import Image from "next/image";
import { BASE_URL } from "../../consts";

interface StrapiImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    loading?: "lazy" | "eager";
    sizes?: string;
    fill?: boolean;
    [key: string]: string | number | boolean | undefined;
}

export function StrapiImage({
    src,
    alt,
    className,
    width = 800,
    height = 600,
    priority = false,
    loading = "lazy",
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    fill,
    ...rest
}: Readonly<StrapiImageProps>) {
    const imageUrl = getStrapiMedia(src);
    if (!imageUrl) return null;

    // Enhanced alt text for better SEO and accessibility
    const enhancedAlt = alt || 'תמונה מפילוסופיה יהודית';

    const imageProps = {
        src: imageUrl,
        alt: enhancedAlt,
        className,
        priority,
        sizes,
        ...rest,
        // Only set loading when priority is false to avoid conflict
        ...(priority ? {} : { loading }),
    };

    if (fill) {
        return <Image {...imageProps} fill alt={enhancedAlt} />;
    }

    return (
        <Image
            {...imageProps}
            width={width}
            height={height}
            alt={enhancedAlt}
        />
    );
}

export function getStrapiMedia(url: string | null) {
    if (url == null) return null;
    if (url.startsWith("data:")) return url;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return BASE_URL + url;
}