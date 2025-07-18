import Image from "next/image";
import { BASE_URL } from "../../consts";

interface StrapiImageProps {
    src: string;
    alt: string;
    className?: string;
    [key: string]: string | number | boolean | undefined;
}

export function StrapiImage({
    src,
    alt,
    className,
    ...rest
}: Readonly<StrapiImageProps>) {
    const imageUrl = getStrapiMedia(src);
    if (!imageUrl) return null;

    return <Image src={imageUrl} alt={alt || 'Place Holder'} className={className} {...rest} />;
}

export function getStrapiMedia(url: string | null) {
    if (url == null) return null;
    if (url.startsWith("data:")) return url;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return BASE_URL + url;
}