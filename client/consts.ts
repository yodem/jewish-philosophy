export const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_BASE_URL || "http://localhost:1337";

// Shared search content types - only single selection allowed
export const CONTENT_TYPES = [
  { value: 'video', label: 'סרטונים' },
  { value: 'playlist', label: 'סדרות' },
  { value: 'blog', label: 'בלוגים' },
  { value: 'responsa', label: 'שו"ת' },
  { value: 'writing', label: 'כתבים' },
];

// Content type configuration for display
export const CONTENT_TYPE_CONFIG = {
  video: { icon: 'Video', label: 'סרטונים', color: 'bg-red-100 text-red-800', path: '/playlists' },
  playlist: { icon: 'List', label: 'פלייליסטים', color: 'bg-green-100 text-green-800', path: '/playlists' },
  blog: { icon: 'FileText', label: 'בלוגים', color: 'bg-blue-100 text-blue-800', path: '/blog' },
  responsa: { icon: 'MessageSquare', label: 'שו"ת', color: 'bg-purple-100 text-purple-800', path: '/responsa' },
  writing: { icon: 'BookOpen', label: 'כתבים', color: 'bg-orange-100 text-orange-800', path: '/writings' },
};
