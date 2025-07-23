export const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || "http://localhost:1337";

// Shared search content types
export const CONTENT_TYPES = [
  { value: 'all', label: 'הכל' },
  { value: 'blog', label: 'בלוגים' },
  { value: 'video', label: 'סרטונים' },
  { value: 'playlist', label: 'סדרות' },
  { value: 'responsa', label: 'שו"ת' },
  { value: 'writing', label: 'כתבים' },
];

// Content type configuration for display
export const CONTENT_TYPE_CONFIG = {
  blog: { icon: 'FileText', label: 'בלוג', color: 'bg-blue-100 text-blue-800', path: '/blog' },
  video: { icon: 'Video', label: 'סרטון', color: 'bg-red-100 text-red-800', path: '/playlists' },
  playlist: { icon: 'List', label: 'רשימת נגינה', color: 'bg-green-100 text-green-800', path: '/playlists' },
  responsa: { icon: 'MessageSquare', label: 'שו"ת', color: 'bg-purple-100 text-purple-800', path: '/responsa' },
  writing: { icon: 'BookOpen', label: 'כתב', color: 'bg-orange-100 text-orange-800', path: '/writings' },
};
