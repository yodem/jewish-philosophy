export interface LinkProps {
  id: number;
  text: string;
  href: string;
  isExternal: boolean;
  nestedLinks?: Omit<LinkProps, 'nestedLinks' | 'isExternal'>[];
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
  categories?: Category[];
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

export type Autor = {
  id: number;
  documentId: string;
  name: string;
}

export type Category = {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  type: 'term' | 'person' | 'genre' | null;
}

export type Blog = {
  id: number;
  documentId: string;
  title: string;
  content: string;
  description: string;
  slug: string;
  coverImage?: ImageProps;
  publishedAt: string;
  author: Autor;
  categories: Category[];
}

export type Thread = {
  id: number;
  documentId: string;
  slug: string;
  answer: string;
  answerer: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  parentComment?: number | Comment;
  responsa?: number | Responsa;
  blog?: number | Blog;
  responsaSlug?: string;
  blogSlug?: string;
  parentCommentSlug: string;
  writings?: Writing[];
  videos?: Video[];
  responsas?: Responsa[];
}

export type Comment = {
  id: number;
  documentId: string;
  answer: string;
  answerer: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  slug: string;
  responsa?: number | Responsa;
  blog?: number | Blog;
  responsaSlug?: string;
  blogSlug?: string;
  threads?: Thread[];
  writings?: Writing[];
  videos?: Video[];
  responsas?: Responsa[];
  blogs?: Blog[];
}

export type Responsa = {
  id: number;
  documentId: string;
  title: string;
  content: string;
  questioneer: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  categories: Category[];
  comments: Comment[];
  writings?: Writing[];
  views?: number | null;
}

export type Writing = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  type: 'book' | 'article';
  linkToWriting?: LinkProps;
  pdfFile?: ImageProps; // Using ImageProps as it has the same structure (url, etc)
  author: Autor;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blogs: Blog[];
  categories: Category[];
  responsas: Responsa[];
  image?: ImageProps;
  priority?: number;
  comments?: Comment[];
  threads?: Thread[];
  views?: number | null;
}

export type Term = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  author: Autor;
  categories: Category[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export type EmailIssueCategory = {
  id: number;
  documentId: string;
  name: string;
  prefix: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Search API Types
export interface SearchResult {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  contentType: 'blog' | 'video' | 'playlist' | 'responsa' | 'writing' | 'term' | 'author' | 'category';
  date?: string;
  slug: string;
  playlistSlug?: string | null;
  relevanceScore: number;
}

export interface SearchResponse {
  data: SearchResult[];
  meta: {
    query: string;
    contentTypes?: string;
    categories?: string;
    limit: number;
    offset: number;
    total: number;
    timestamp: string;
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SearchQuery {
  query: string;
  contentTypes?: string;
  categories?: string;
}

export interface SearchFilters {
  query?: string;
  contentType?: 'blog' | 'video' | 'playlist' | 'responsa' | 'writing' | 'all';
  category?: string;
  page?: number;
  pageSize?: number;
  offset?: number;
  sort?: string[];
}

export type Banner = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  link?: string;
  date?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}