import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Blog, Category, ImageProps, Responsa, Comment } from "@/types";

const homePageQuery = qs.stringify({
  populate: {
    blocks: {
      populate: '*'
    }
  }
});

export async function getHomePage() {
  const path = "/api/home-page";
  const url = new URL(path, BASE_URL);
  url.search = homePageQuery;

  return await fetchAPI(url.href, { method: "GET" });
}

const pageBySlugQuery = (slug: string) =>
  qs.stringify({
    filters: {
      slug: {
        $eq: slug,
      },
    },
    populate: {
      blocks: {
        populate: '*'
      },
    },
  });

export async function getPageBySlug(slug: string) {
  const path = "/api/pages";
  const url = new URL(path, BASE_URL);
  url.search = pageBySlugQuery(slug);
  return await fetchAPI(url.href, { method: "GET" });
}

const globalSettingQuery = qs.stringify({
  populate: {
    header: {
      populate: {
        logo: {
          populate: {
            image: {
              fields: ["url", "alternativeText"],
            },
          },
        },
        navigation: true,
        cta: true,
      },
    },
    footer: {
      populate: {
        links: true,
      },
    },
  },
});

export async function getGlobalSettings() {
  const path = "/api/global";
  const url = new URL(path, BASE_URL);
  url.search = globalSettingQuery;
  return fetchAPI(url.href, { method: "GET" });
}

const allPlaylistsQuery = qs.stringify({
  populate: '*',
});

export async function getAllPlaylists() {
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = allPlaylistsQuery;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data
}

export async function searchPlaylists(search = '') {
  const query = qs.stringify({
    populate: '*',
    ...(search ? {
      filters: {
        $or: [
          { title: { $containsi: search } },
          { description: { $containsi: search } }
        ]
      }
    } : {})
  });

  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data;
}

export async function searchVideos(search = '') {
  const query = qs.stringify({
    populate: '*',
    ...(search ? {
      filters: {
        $or: [
          { title: { $containsi: search } },
          { description: { $containsi: search } }
        ]
      }
    } : {})
  });

  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data;
}

export async function getPlaylistBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: { videos: { populate: '*' } },
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  
  const item = res.data?.[0]
  return item
}

export async function getVideoBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: '*',
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  const item = res.data[0]
  return item
}

// Blog queries
const allBlogsQuery = qs.stringify({
  populate: '*',
  sort: ['publishedAt:desc'],
});

export async function getAllBlogs(): Promise<Blog[]> {
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = allBlogsQuery;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data
}

export async function searchBlogs(search = '', categoryId?: string) {
  const filters: Record<string, any> = {};
  
  if (search && categoryId) {
    filters.$and = [
      {
        $or: [
          { title: { $containsi: search } },
          { description: { $containsi: search } },
          { content: { $containsi: search } }
        ]
      },
      {
        categories: {
          id: { $eq: categoryId }
        }
      }
    ];
  } else if (search) {
    filters.$or = [
      { title: { $containsi: search } },
      { description: { $containsi: search } },
      { content: { $containsi: search } }
    ];
  } else if (categoryId) {
    filters.categories = {
      id: { $eq: categoryId }
    };
  }

  const query = qs.stringify({
    populate: '*',
    sort: ['publishedAt:desc'],
    ...(Object.keys(filters).length > 0 ? { filters } : {})
  });

  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data;
}

export async function getBlogBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: '*',
  });
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  
  return res.data[0]
}

// Responsa queries
const responsaPageQuery = qs.stringify({
  populate: {
    heroSection: {
      populate: '*'
    }
  }
});

export async function getResponsaPage() {
  const path = "/api/responsa-page";
  const url = new URL(path, BASE_URL);
  url.search = responsaPageQuery;
  return await fetchAPI(url.href, { method: "GET" });
}

export async function getAllResponsas(page = 1, pageSize = 10, search = '') {
  const query = qs.stringify({
    populate: {
      categories: true,
      comments: true
    },
    sort: ['createdAt:desc'],
    pagination: {
      page,
      pageSize
    },
    ...(search ? {
      filters: {
        title: {
          $containsi: search
        }
      }
    } : {})
  });
  
  const path = "/api/responsas";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return {
    data: res.data,
    meta: res.meta
  };
}

export async function getResponsaBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: {
      categories: true,
      comments: {
        populate: '*',
        sort: ['createdAt:asc']
      }
    },
  });
  const path = "/api/responsas";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  
  return res.data[0];
}

export async function createComment(data: { answer: string; answerer: string; responsa: number }) {
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  
  return await fetchAPI(url.href, { 
    method: "POST",
    body: { data }
  });
}

// Category queries
export async function getAllCategories(): Promise<Category[]> {
  const query = qs.stringify({
    sort: ['name:asc'],
  });
  
  const path = "/api/categories";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data;
}

// Universal search function for navbar
export async function universalSearch(query: string, contentType?: string, categoryId?: string) {
  const results: {
    blogs: Blog[];
    playlists: Array<{
      id: number;
      title: string;
      description: string;
      slug: string;
      imageUrl300x400?: string;
      imageUrlStandard?: string;
    }>;
    videos: Array<{
      id: number;
      title: string;
      description: string;
      slug: string;
      imageUrl300x400?: string;
      imageUrlStandard?: string;
      playlist: any;
    }>;
    responsas: Responsa[];
  } = {
    blogs: [],
    playlists: [],
    videos: [],
    responsas: []
  };

  try {
    if (!contentType || contentType === 'blog') {
      results.blogs = await searchBlogs(query, categoryId);
    }
    
    if (!contentType || contentType === 'playlist') {
      results.playlists = await searchPlaylists(query);
    }
    
    if (!contentType || contentType === 'video') {
      results.videos = await searchVideos(query);
    }
    
    if (!contentType || contentType === 'responsa') {
      const responsaResult = await getAllResponsas(1, 50, query);
      results.responsas = responsaResult.data;
    }
  } catch (error) {
    console.error('Error in universal search:', error);
  }

  return results;
}