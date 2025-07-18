export interface LinkProps {
  id: number;
  text: string;
  href: string;
  isExternal: boolean;
}

export interface ImageProps {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string;
}

export interface LogoProps {
  logoText: string;
  image: ImageProps;
}

type ComponentType = "blocks.hero-section" | "blocks.info-block" | "blocks.subscribe";

interface Base<
  T extends ComponentType,
  D extends object = Record<string, unknown>,
> {
  id: number;
  __component?: T;
  documentId?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  data?: D;
}

export type Block = HeroSectionProps | InfoBlockProps | SubscribeProps;

export interface HeroSectionProps extends Base<"blocks.hero-section"> {
  heading: string;
  image: ImageProps;
  cta?: LinkProps;
}

export interface InfoBlockProps extends Base<"blocks.info-block"> {
  reversed?: boolean;
  heading: string;
  content: string;
  image: ImageProps;
  cta?: LinkProps;
}

export interface SubscribeProps extends Base<"blocks.subscribe"> {
  headline: string;
  content: string;
  placeholder: string;
  buttonText: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  imageUrl300x400: string;
  imageUrlStandard: string;
  videoId: string;
  slug: string;
  playlist: number | Playlist;
}

export interface Playlist {
  id: number;
  title: string;
  description: string;
  imageUrl300x400: string;
  imageUrlStandard: string;
  youtubeId: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  videos: Video[];
}

export interface NavbarHeader {
  logo?: LogoProps;
  navigation?: LinkProps[];
  cta?: LinkProps;
}
