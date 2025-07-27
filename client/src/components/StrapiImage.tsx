import Image from "next/image";
import { BASE_URL } from "../../consts";
import { cn } from "@/lib/utils";

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
    aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
    objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
    quality?: number;
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
    sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
    fill,
    aspectRatio = "auto",
    objectFit = "cover",
    quality = 85,
    ...rest
}: Readonly<StrapiImageProps>) {
    const imageUrl = getStrapiMedia(src);
    if (!imageUrl) return null;

    // Enhanced alt text for better SEO and accessibility
    const enhancedAlt = alt || 'תמונה מפילוסופיה יהודית';

    // Calculate dimensions based on aspect ratio to prevent distortion
    const getOptimizedDimensions = () => {
        switch (aspectRatio) {
            case "square":
                return { width: Math.min(width, height), height: Math.min(width, height) };
            case "video":
                return { width: width, height: Math.round(width * 9 / 16) };
            case "portrait":
                return { width: width, height: Math.round(width * 4 / 3) };
            case "landscape":
                return { width: width, height: Math.round(width * 3 / 4) };
            default:
                return { width, height };
        }
    };

    const { width: optWidth, height: optHeight } = getOptimizedDimensions();

    // Enhanced CSS classes for better responsive behavior
    const getResponsiveClasses = () => {
        const baseClasses = "transition-all duration-300";
        
        switch (aspectRatio) {
            case "square":
                return cn(baseClasses, "aspect-square", className);
            case "video":
                return cn(baseClasses, "aspect-video", className);
            case "portrait":
                return cn(baseClasses, "aspect-[3/4]", className);
            case "landscape":
                return cn(baseClasses, "aspect-[4/3]", className);
            default:
                return cn(baseClasses, className);
        }
    };

    const imageProps = {
        src: imageUrl,
        alt: enhancedAlt,
        className: getResponsiveClasses(),
        priority,
        sizes,
        quality,
        style: {
            objectFit,
            objectPosition: "center",
        },
        ...rest,
        // Only set loading when priority is false to avoid conflict
        ...(priority ? {} : { loading }),
    };

    if (fill) {
        return (
            <div className={cn("relative overflow-hidden", getResponsiveClasses())}>
                <Image 
                    {...imageProps} 
                    fill 
                    alt={enhancedAlt}
                    style={{
                        objectFit,
                        objectPosition: "center",
                    }}
                />
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden", aspectRatio !== "auto" ? "block" : "")}>
            <Image
                {...imageProps}
                width={optWidth}
                height={optHeight}
                alt={enhancedAlt}
                style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit,
                    objectPosition: "center",
                }}
            />
        </div>
    );
}

export function getStrapiMedia(url: string | null) {
    if (url == null) return null;
    if (url.startsWith("data:")) return url;
    if (url.startsWith("http") || url.startsWith("//")) return url;
    return BASE_URL + url;
}

// Utility function for generating responsive image sources
export function generateResponsiveImageSizes(
    baseWidth: number,
    breakpoints: number[] = [640, 768, 1024, 1280, 1536]
): string {
    const sizes = breakpoints
        .map((bp, index) => {
            const nextBp = breakpoints[index + 1];
            const percentage = Math.round((baseWidth / bp) * 100);
            
            if (nextBp) {
                return `(max-width: ${bp}px) ${Math.min(percentage, 100)}vw`;
            } else {
                return `${Math.min(percentage, 50)}vw`;
            }
        })
        .join(", ");
    
    return sizes;
}

// Utility for placeholder generation
export function generatePlaceholder(width: number, height: number): string {
    return `data:image/svg+xml;base64,${Buffer.from(
        `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f3f4f6"/>
            <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" 
                  text-anchor="middle" dy=".3em" fill="#9ca3af">טוען תמונה...</text>
        </svg>`
    ).toString('base64')}`;
}