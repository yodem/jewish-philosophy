import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Blog, Writing } from "@/types";
import { buildSEOPluginQuery } from "@/lib/strapi-seo-plugin";

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
            image: true
          }
        },
        navigation: true,
        cta: true
      }
    },
    footer: {
      populate: '*'
    }
  }
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

export async function getPlaylistsPaginated(page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    populate: '*',
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
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

export async function getPlaylistVideosPaginated(playlistId: number, page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    filters: {
      playlists: {
        id: { $eq: playlistId }
      }
    },
    populate: '*',
    pagination: {
      page,
      pageSize
    },
    sort: ['createdAt:asc'] // Maintain video order in playlist
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
}

export async function getAllPlaylistVideos(playlistId: number) {
  const query = qs.stringify({
    filters: {
      playlists: {
        id: { $eq: playlistId }
      }
    },
    populate: '*',
    pagination: {
      pageSize: 100 // Get up to 100 videos in one call
    },
    sort: ['createdAt:asc'] // Maintain video order in playlist
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
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

export async function getVideosPaginated(page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    populate: '*',
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
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

export async function getBlogsPaginated(page: number = 1, pageSize: number = 12): Promise<Blog[]> {
  const query = qs.stringify({
    populate: '*',
    sort: ['publishedAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
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

// Enhanced SEO-aware blog loader using official Strapi SEO plugin
export async function getBlogBySlugWithSEO(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    ...JSON.parse(buildSEOPluginQuery().replace('populate=', ''))
  });
  const path = "/api/blogs";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  console.log(res);
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
        sort: ['createdAt:asc']
      }
    },
  });
  const path = "/api/responsas";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  
  const responsa = res.data[0];
  
  // If comments are not populated, fetch them separately
  if (!responsa.comments || responsa.comments.length === 0) {
    const commentsQuery = qs.stringify({
      filters: {
        responsa: { id: { $eq: responsa.id } }
      },
      sort: ['createdAt:asc']
    });
    const commentsUrl = new URL("/api/comments", BASE_URL);
    commentsUrl.search = commentsQuery;
    const commentsRes = await fetchAPI(commentsUrl.href, { method: "GET" });
    
    if (commentsRes.data) {
      responsa.comments = commentsRes.data;
    }
  }
  
  return responsa;
}

export async function createComment(data: { answer: string; answerer: string; responsa: number }) {
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  
  const result = await fetchAPI(url.href, { 
    method: "POST",
    body: { data }
  });
  
  return result;
}

export async function getResponsaComments(responsaId: number) {
  const query = qs.stringify({
    filters: {
      responsa: { id: { $eq: responsaId } }
    },
    sort: ['createdAt:asc']
  });
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
}

// Writing queries
const allWritingsQuery = qs.stringify({
  populate: '*',
  sort: ['publishedAt:desc'],
});

export async function getAllWritings(): Promise<Writing[]> {
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = allWritingsQuery;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
}

export async function getWritingsPaginated(page: number = 1, pageSize: number = 12): Promise<Writing[]> {
  const query = qs.stringify({
    populate: '*',
    sort: ['publishedAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  
  return res.data || [];
}

export async function getWritingsByType(type: 'book' | 'article', page: number = 1, pageSize: number = 12): Promise<Writing[]> {
  const query = qs.stringify({
    filters: {
      type: {
        $eq: type
      }
    },
    populate: '*',
    sort: ['publishedAt:desc'],
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  console.log(res.data);
  
  return res.data || [];
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: '*',
  });
  const path = "/api/writings";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET" });
  if (res.data.length === 0) return null;
  
  return res.data[0];
}