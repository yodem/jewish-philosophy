import { fetchAPI } from "@/utils/fetchApi";
import { BASE_URL } from "../../consts";
import qs from "qs";
import { Blog, Writing } from "@/types";


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

  return await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 14 } });
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
  return await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
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
  return fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
}

const allPlaylistsQuery = qs.stringify({
  populate: {
    videos: {
      filters: {
        title: {
          $ne: 'Private video'
        }
      },
      populate: '*'
    }
  },
});

export async function getAllPlaylists() {
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = allPlaylistsQuery;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data
}

export async function getPlaylistsPaginated(page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    populate: {
      videos: {
        filters: {
          title: {
            $ne: 'Private video'
          }
        },
        populate: '*'
      }
    },
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getPlaylistBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
    },
    populate: { 
      videos: { 
        filters: {
          title: {
            $ne: 'Private video'
          }
        },
        populate: '*' 
      } 
    },
  });
  const path = "/api/playlists";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  if (res.data.length === 0) return null;
  
  const item = res.data?.[0]
  return item
}

export async function getPlaylistVideosPaginated(playlistId: number, page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    filters: {
      playlists: {
        id: { $eq: playlistId }
      },
      title: {
        $ne: 'Private video'
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getAllPlaylistVideos(playlistId: number) {
  const query = qs.stringify({
    filters: {
      playlists: {
        id: { $eq: playlistId }
      },
      title: {
        $ne: 'Private video'
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
  return res.data || [];
}

export async function getVideoBySlug(slug: string) {
  const query = qs.stringify({
    filters: {
      slug: { $eq: slug },
      title: {
        $ne: 'Private video'
      }
    },
    populate: '*',
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  if (res.data.length === 0) return null;
  const item = res.data[0]
  return item
}

export async function getVideosPaginated(page: number = 1, pageSize: number = 12) {
  const query = qs.stringify({
    filters: {
      title: {
        $ne: 'Private video'
      }
    },
    populate: '*',
    pagination: {
      page,
      pageSize
    }
  });
  const path = "/api/videos";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
  
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 7 } });
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
  return await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 3 } });
}

export async function getAllResponsas(page = 1, pageSize = 10, search = '') {
  const query = qs.stringify({
    populate: {
      categories: true,
      comments: {
        filters: {
          publishedAt: { $notNull: true }
        }
      }
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 } });
  
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
        filters: {
          publishedAt: { $notNull: true }
        },
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

export async function createComment(data: { answer: string; answerer: string; responsaSlug: string }) {
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
      responsa: { id: { $eq: responsaId } },
      publishedAt: { $notNull: true }
    },
    sort: ['createdAt:asc']
  });
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 2 } });
  
  return res.data || [];
}

export async function getResponsaCommentsBySlug(responsaSlug: string) {
  const query = qs.stringify({
    filters: {
      responsa: { slug: { $eq: responsaSlug } },
      publishedAt: { $notNull: true }
    },
    sort: ['createdAt:asc']
  });
  const path = "/api/comments";
  const url = new URL(path, BASE_URL);
  url.search = query;
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 2 } });
  
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
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
  const res = await fetchAPI(url.href, { method: "GET", next: { revalidate: 60 * 60 * 24 * 30 } });
  if (res.data.length === 0) return null;
  
  return res.data[0];
}